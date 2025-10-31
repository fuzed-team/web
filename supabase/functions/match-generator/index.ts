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
}

interface UserProfile {
	id: string;
	school: string;
	gender: string;
	name: string;
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
	match_type: string;
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

		console.log("Fetching next pending job...");

		// Fetch next pending job (FIFO: oldest first)
		const { data: job, error: fetchError } = await supabase
			.from("match_jobs")
			.select("*")
			.eq("status", "pending")
			.order("created_at", { ascending: true })
			.limit(1)
			.maybeSingle();

		if (fetchError) {
			console.error("Error fetching job:", fetchError);
			throw new Error(`Failed to fetch job: ${fetchError.message}`);
		}

		// No pending jobs
		if (!job) {
			console.log("No pending jobs in queue");
			return new Response(
				JSON.stringify({
					success: true,
					message: "No pending jobs",
					processed: false,
				}),
				{
					headers: { ...corsHeaders, "Content-Type": "application/json" },
					status: 200,
				},
			);
		}

		const typedJob = job as MatchJob;
		console.log(`Processing job ${typedJob.id} for user ${typedJob.user_id}`);

		// Mark job as processing
		const { error: updateError } = await supabase
			.from("match_jobs")
			.update({
				status: "processing",
				started_at: new Date().toISOString(),
				attempts: typedJob.attempts + 1,
			})
			.eq("id", typedJob.id);

		if (updateError) {
			console.error("Error updating job status:", updateError);
			throw new Error(
				`Failed to mark job as processing: ${updateError.message}`,
			);
		}

		// Get user profile for filtering
		console.log(`Fetching profile for user ${typedJob.user_id}`);
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("id, school, gender, name")
			.eq("id", typedJob.user_id)
			.maybeSingle();

		if (profileError || !profile) {
			const errorMsg = profileError?.message || "Profile not found";
			console.error("Error fetching profile:", errorMsg);

			// Mark job as failed (no retry for missing profile)
			await supabase
				.from("match_jobs")
				.update({
					status: "failed",
					completed_at: new Date().toISOString(),
					error_message: errorMsg,
				})
				.eq("id", typedJob.id);

			throw new Error(errorMsg);
		}

		const typedProfile = profile as UserProfile;
		console.log(
			`User profile: school=${typedProfile.school}, gender=${typedProfile.gender}`,
		);

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

			throw new Error(errorMsg);
		}

		// Find similar faces (filtered by school and gender)
		console.log("Searching for similar faces...");
		console.log(
			`Filters: school="${typedProfile.school}", opposite_gender="${typedProfile.gender}", threshold=2.0, limit=20`,
		);

		const { data: matches, error: searchError } = await supabase.rpc(
			"find_similar_faces_filtered",
			{
				query_embedding: typedJob.embedding,
				user_school: typedProfile.school,
				user_gender: typedProfile.gender,
				exclude_profile_id: typedProfile.id,
				match_threshold: 2.0,
				match_count: 20,
			},
		);

		if (searchError) {
			console.error("Error searching for similar faces:", searchError);

			// Check if we should retry
			if (typedJob.attempts + 1 < typedJob.max_attempts) {
				// Mark as pending to retry later
				await supabase
					.from("match_jobs")
					.update({
						status: "pending",
						error_message: searchError.message,
					})
					.eq("id", typedJob.id);

				console.log(
					`Job marked for retry (attempt ${typedJob.attempts + 1}/${typedJob.max_attempts})`,
				);
			} else {
				// Max attempts reached, mark as failed
				await supabase
					.from("match_jobs")
					.update({
						status: "failed",
						completed_at: new Date().toISOString(),
						error_message: `Max attempts reached: ${searchError.message}`,
					})
					.eq("id", typedJob.id);

				console.error("Max retry attempts reached, job failed");
			}

			throw new Error(`Search failed: ${searchError.message}`);
		}

		const typedMatches = (matches || []) as SimilarFace[];
		console.log(`Found ${typedMatches.length} similar faces`);

		// If no matches found, mark job as completed (not an error)
		if (typedMatches.length === 0) {
			await supabase
				.from("match_jobs")
				.update({
					status: "completed",
					completed_at: new Date().toISOString(),
				})
				.eq("id", typedJob.id);

			console.log("Job completed with 0 matches");

			return new Response(
				JSON.stringify({
					success: true,
					message: "No similar faces found",
					jobId: typedJob.id,
					matchCount: 0,
					processed: true,
				}),
				{
					headers: { ...corsHeaders, "Content-Type": "application/json" },
					status: 200,
				},
			);
		}

		// Prepare match records for batch insert
		// Ensure face_a_id < face_b_id to prevent duplicates (enforced by CHECK constraint)
		const matchRecords: MatchRecord[] = typedMatches.map((match) => ({
			face_a_id:
				typedJob.face_id < match.face_id ? typedJob.face_id : match.face_id,
			face_b_id:
				typedJob.face_id < match.face_id ? match.face_id : typedJob.face_id,
			similarity_score: match.similarity,
			match_type: "user_to_user",
		}));

		console.log(`Inserting ${matchRecords.length} match records...`);

		// Batch insert matches (upsert to handle duplicates gracefully)
		const { error: insertError } = await supabase
			.from("matches")
			.upsert(matchRecords, {
				onConflict: "face_a_id,face_b_id",
				ignoreDuplicates: true,
			});

		if (insertError) {
			console.error("Error inserting matches:", insertError);

			// Retry logic
			if (typedJob.attempts + 1 < typedJob.max_attempts) {
				await supabase
					.from("match_jobs")
					.update({
						status: "pending",
						error_message: insertError.message,
					})
					.eq("id", typedJob.id);

				console.log(
					`Job marked for retry (attempt ${typedJob.attempts + 1}/${typedJob.max_attempts})`,
				);
			} else {
				await supabase
					.from("match_jobs")
					.update({
						status: "failed",
						completed_at: new Date().toISOString(),
						error_message: `Max attempts reached: ${insertError.message}`,
					})
					.eq("id", typedJob.id);

				console.error("Max retry attempts reached, job failed");
			}

			throw new Error(`Failed to insert matches: ${insertError.message}`);
		}

		// Mark job as completed
		const { error: completeError } = await supabase
			.from("match_jobs")
			.update({
				status: "completed",
				completed_at: new Date().toISOString(),
			})
			.eq("id", typedJob.id);

		if (completeError) {
			console.error("Error marking job as completed:", completeError);
			// Don't throw - matches were inserted successfully
		}

		console.log(
			`✅ Job ${typedJob.id} completed successfully with ${matchRecords.length} matches`,
		);

		// Return success response
		return new Response(
			JSON.stringify({
				success: true,
				message: "Matches generated successfully",
				jobId: typedJob.id,
				userId: typedJob.user_id,
				matchCount: matchRecords.length,
				processed: true,
				matches: typedMatches.map((m) => ({
					profile_name: m.profile_name,
					similarity: Math.round(m.similarity * 100) / 100,
				})),
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
				processed: false,
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

5. Monitor via Supabase Dashboard:
   Functions → match-generator → Invocations
*/
