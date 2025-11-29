// Match Generator Edge Function
// Purpose: Process pending face matching jobs from match_jobs queue
// Triggered by: pg_cron every minute
// Architecture: Supabase Edge Function (Deno runtime)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Types
interface MatchJob {
	id: string;
	face_id: string;
	user_id: string;
	embedding: number[];
	status: string;
	attempts: number;
	max_attempts: number;
	created_at: string;
	job_type?: string; // 'user_match', 'celebrity_match', or 'both'
	next_run_at?: string;
}

interface UserProfile {
	id: string;
	school: string;
	gender: string;
	name: string;
	default_face_id?: string;
}

interface SimilarFace {
	face_id: string;
	profile_id: string;
	similarity: number;
	image_path: string;
	profile_name: string;
	profile_gender: string;
	profile_school: string;
}

interface MatchRecord {
	face_a_id: string;
	face_b_id: string;
	similarity_score: number;
}

interface CelebrityMatchRecord {
	face_id: string;
	celebrity_id: string;
	similarity_score: number;
}

interface CelebrityMatch {
	celebrity_id: string;
	celebrity_name: string;
	similarity: number;
	image_path: string;
	bio?: string;
	category?: string;
	gender?: string;
}
// CORS headers for API responses
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"authorization, x-client-info, apikey, content-type",
};

console.log("Match Generator Edge Function initialized");

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}

	try {
		// Initialize Supabase client with service role
		const supabaseUrl = Deno.env.get("SUPABASE_URL");
		const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

		if (!supabaseUrl || !supabaseServiceRoleKey) {
			throw new Error(
				"Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables",
			);
		}

		const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});

		console.log("Fetching pending jobs...");

		// Fetch next pending jobs (FIFO: oldest first)
		// INCREASED LIMIT TO 20 for batch processing (Paid Plan)
		const { data: jobs, error: fetchError } = await supabase
			.from("match_jobs")
			.select("*")
			.eq("status", "pending")
			.lte("next_run_at", new Date().toISOString()) // Only fetch jobs ready to run
			.order("next_run_at", { ascending: true }) // Prioritize by schedule
			.order("created_at", { ascending: true })
			.limit(20);

		if (fetchError) {
			console.error("Error fetching jobs:", fetchError);
			throw new Error(`Failed to fetch jobs: ${fetchError.message}`);
		}

		// No pending jobs
		if (!jobs || jobs.length === 0) {
			console.log("No pending jobs in queue");
			return new Response(
				JSON.stringify({
					success: true,
					message: "No pending jobs",
					processedCount: 0,
				}),
				{
					headers: { ...corsHeaders, "Content-Type": "application/json" },
					status: 200,
				},
			);
		}

		console.log(
			`Found ${jobs.length} pending jobs. Starting batch processing...`,
		);

		// Fetch settings ONCE outside the loop
		const { data: settings } = await supabase
			.from("system_settings")
			.select("key, value")
			.in("key", [
				"match_threshold",
				"match_rate_limit",
				"match_time_window_minutes",
			]);

		const getSetting = (key: string, defaultValue: any) => {
			const setting = settings?.find((s) => s.key === key);
			return setting?.value ?? defaultValue;
		};

		const matchThreshold = getSetting("match_threshold", 0.5) as number;
		const matchRateLimit = getSetting("match_rate_limit", 2) as number;
		const timeWindowMinutes = getSetting(
			"match_time_window_minutes",
			60,
		) as number;

		const results = [];

		// Process each job
		for (const job of jobs) {
			const typedJob = job as MatchJob;
			const jobResult = {
				jobId: typedJob.id,
				userId: typedJob.user_id,
				success: false,
				message: "",
				userMatchCount: 0,
				celebrityMatchCount: 0,
			};

			try {
				console.log(
					`Processing job ${typedJob.id} for user ${typedJob.user_id}`,
				);

				// Mark job as processing
				const { error: updateError } = await supabase
					.from("match_jobs")
					.update({
						status: "processing",
						started_at: new Date().toISOString(),
					})
					.eq("id", typedJob.id);

				if (updateError) {
					console.error(
						`Error updating job ${typedJob.id} status:`,
						updateError,
					);
					jobResult.message = `Failed to mark as processing: ${updateError.message}`;
					results.push(jobResult);
					continue; // Skip to next job
				}

				// Get user profile
				const { data: profile, error: profileError } = await supabase
					.from("profiles")
					.select("id, school, gender, name, default_face_id")
					.eq("id", typedJob.user_id)
					.maybeSingle();

				if (profileError || !profile) {
					const errorMsg = profileError?.message || "Profile not found";
					console.error(
						`Error fetching profile for job ${typedJob.id}:`,
						errorMsg,
					);

					await supabase
						.from("match_jobs")
						.update({
							status: "failed",
							completed_at: new Date().toISOString(),
							error_message: errorMsg,
						})
						.eq("id", typedJob.id);

					jobResult.message = errorMsg;
					results.push(jobResult);
					continue;
				}

				const typedProfile = profile as UserProfile;

				// Validate face is still the user's default
				if (typedProfile.default_face_id !== typedJob.face_id) {
					console.log(
						`Face ${typedJob.face_id} is no longer default for user ${typedJob.user_id}`,
					);

					await supabase
						.from("match_jobs")
						.update({
							status: "completed",
							completed_at: new Date().toISOString(),
							error_message: "Face no longer set as default",
						})
						.eq("id", typedJob.id);

					jobResult.success = true;
					jobResult.message = "Face no longer default";
					results.push(jobResult);
					continue;
				}

				// Settings fetch removed from here (moved outside loop)

				// Validate profile has required fields
				if (!typedProfile.school || !typedProfile.gender) {
					const errorMsg = "User profile missing school or gender";
					console.error(errorMsg);

					await supabase
						.from("match_jobs")
						.update({
							status: "failed",
							completed_at: new Date().toISOString(),
							error_message: errorMsg,
						})
						.eq("id", typedJob.id);

					jobResult.message = errorMsg;
					results.push(jobResult);
					continue;
				}

				// Find similar faces
				const { data: matches, error: searchError } = await supabase.rpc(
					"find_similar_faces_advanced",
					{
						query_face_id: typedJob.face_id,
						user_school: typedProfile.school,
						user_gender: typedProfile.gender,
						match_threshold: matchThreshold,
						match_count: matchRateLimit,
					},
				);

				if (searchError) {
					console.error(
						`Error searching faces for job ${typedJob.id}:`,
						searchError,
					);

					if (typedJob.attempts < typedJob.max_attempts) {
						await supabase
							.from("match_jobs")
							.update({
								status: "pending",
								attempts: typedJob.attempts + 1,
								error_message: searchError.message,
							})
							.eq("id", typedJob.id);
					} else {
						await supabase
							.from("match_jobs")
							.update({
								status: "failed",
								attempts: typedJob.attempts + 1,
								completed_at: new Date().toISOString(),
								error_message: `Max attempts reached: ${searchError.message}`,
							})
							.eq("id", typedJob.id);
					}

					jobResult.message = `Search failed: ${searchError.message}`;
					results.push(jobResult);
					continue;
				}

				const typedMatches = (matches || []) as SimilarFace[];

				// Prepare match records
				const matchRecords: MatchRecord[] = typedMatches.map((match) => ({
					face_a_id:
						typedJob.face_id < match.face_id ? typedJob.face_id : match.face_id,
					face_b_id:
						typedJob.face_id < match.face_id ? match.face_id : typedJob.face_id,
					similarity_score: match.similarity,
				}));

				// Insert user matches
				// REMOVED DELAY: Inserting as fast as possible
				let userInsertedCount = 0;
				for (let i = 0; i < matchRecords.length; i++) {
					const userMatch = matchRecords[i];
					const { error: insertError } = await supabase
						.from("matches")
						.insert(userMatch)
						.select();

					if (insertError) {
						if (insertError.code !== "23505") {
							// Ignore duplicates
							console.error(
								`Error inserting user match: ${insertError.message}`,
							);
						}
					} else {
						userInsertedCount++;
					}
				}

				// Celebrity Matching (only if job_type includes celebrity_match or both)
				let celebrityMatchCount = 0;
				const jobType = typedJob.job_type || "both";

				if (jobType === "celebrity_match" || jobType === "both") {
					const { data: celebrityMatches, error: celebError } =
						await supabase.rpc("find_celebrity_matches_advanced", {
							query_face_id: typedJob.face_id,
							user_gender: typedProfile.gender,
							match_threshold: matchThreshold,
							match_count: 20,
							category_filter: null,
						});

					if (!celebError && celebrityMatches && celebrityMatches.length > 0) {
						const typedCelebMatches = celebrityMatches as CelebrityMatch[];
						const celebMatchRecords: CelebrityMatchRecord[] =
							typedCelebMatches.map((celeb) => ({
								face_id: typedJob.face_id,
								celebrity_id: celeb.celebrity_id,
								similarity_score: celeb.similarity,
							}));

						let insertedCount = 0;
						for (const celebMatch of celebMatchRecords) {
							const { error: celebInsertError } = await supabase
								.from("celebrity_matches")
								.insert(celebMatch)
								.select();

							if (!celebInsertError || celebInsertError.code === "23505") {
								if (!celebInsertError) insertedCount++;
							}
						}
						celebrityMatchCount = insertedCount;
					}
				}

				// Calculate next run time
				const nextRunAt = new Date(Date.now() + timeWindowMinutes * 60 * 1000);

				// Update job status
				await supabase
					.from("match_jobs")
					.update({
						status: "pending", // Keep pending for continuous matching
						next_run_at: nextRunAt.toISOString(),
					})
					.eq("id", typedJob.id);

				console.log(
					`✅ Job ${typedJob.id} processed: ${userInsertedCount} user, ${celebrityMatchCount} celeb matches`,
				);

				jobResult.success = true;
				jobResult.message = "Completed successfully";
				jobResult.userMatchCount = userInsertedCount;
				jobResult.celebrityMatchCount = celebrityMatchCount;
				results.push(jobResult);
			} catch (jobError: any) {
				console.error(
					`Unexpected error processing job ${typedJob.id}:`,
					jobError,
				);
				jobResult.message = `Unexpected error: ${jobError.message}`;
				results.push(jobResult);
			}
		}

		// Return batch summary
		return new Response(
			JSON.stringify({
				success: true,
				message: `Processed ${results.length} jobs`,
				processedCount: results.length,
				results: results,
			}),
			{
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 200,
			},
		);
	} catch (error: any) {
		console.error("Match generation failed:", error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error.message || "Unknown error",
			}),
			{
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 500,
			},
		);
	}
});

/* Edge Function Deployment Instructions:

1. Deploy this function:
   supabase functions deploy match-generator

2. Set required secrets:
   supabase secrets set SUPABASE_URL=https://your-project.supabase.co
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

3. Test the function:
   curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/match-generator' \
     --header 'Authorization: Bearer your-anon-key' \
     --header 'Content-Type: application/json' \
     --data '{"source":"manual_test"}'

4. View logs:
   supabase functions logs match-generator --tail
*/
