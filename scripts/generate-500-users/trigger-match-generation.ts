import { createClient } from "@supabase/supabase-js";

/**
 * Trigger Match Generation for All Test Users
 *
 * Creates match_jobs entries for all users with face embeddings,
 * which will be processed by the match-generator Edge Function.
 */

const SCHOOL = "Columbia University";

async function triggerMatchGeneration() {
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	console.log("🚀 Triggering match generation for test users...\n");

	// Fetch all faces with embeddings for test users
	const { data: faces, error: fetchError } = await supabase
		.from("faces")
		.select(
			`
      id,
      profile_id,
      embedding,
      profile:profiles!faces_profile_id_fkey (
        id,
        school,
        name
      )
    `,
		)
		.not("embedding", "is", null);

	if (fetchError) {
		console.error("❌ Error fetching faces:", fetchError);
		throw fetchError;
	}

	// Filter by school
	const testFaces = faces?.filter(
		(face: any) => face.profile?.school === SCHOOL,
	);

	if (!testFaces || testFaces.length === 0) {
		console.log("ℹ️  No faces found with embeddings");
		console.log("   Make sure you've run analyze-faces-replicate.ts first!");
		return;
	}

	console.log(`📊 Found ${testFaces.length} faces ready for matching\n`);

	// Create match jobs for all users
	const jobs = testFaces.map((face: any) => ({
		face_id: face.id,
		user_id: face.profile_id,
		status: "pending",
		attempts: 0,
		max_attempts: 3,
		job_type: "user_match",
		next_run_at: new Date().toISOString(),
	}));

	console.log(`📝 Creating ${jobs.length} match jobs...\n`);

	// Insert in batches to avoid payload limits
	const BATCH_SIZE = 100;
	let insertedCount = 0;

	for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
		const batch = jobs.slice(i, i + BATCH_SIZE);

		const { error } = await supabase.from("match_jobs").insert(batch);

		if (error) {
			console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
			throw error;
		}

		insertedCount += batch.length;
		console.log(
			`💾 Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(jobs.length / BATCH_SIZE)} (${insertedCount}/${jobs.length} total)`,
		);
	}

	console.log(`\n🎉 Successfully created ${insertedCount} match jobs!`);
	console.log(
		`\n⏳ Jobs are now queued for processing by match-generator Edge Function`,
	);
	console.log(
		`   The pg_cron job runs every minute and processes jobs FIFO.\n`,
	);

	console.log(`📊 Monitor progress with these SQL queries:`);
	console.log(`\n-- Job status overview:`);
	console.log(`SELECT status, COUNT(*) FROM match_jobs GROUP BY status;\n`);
	console.log(`-- Match generation rate:`);
	console.log(
		`SELECT COUNT(*) as total_matches FROM matches WHERE created_at > NOW() - INTERVAL '1 hour';\n`,
	);

	console.log(
		`\n🔍 Check Supabase Dashboard → Edge Functions → match-generator for logs\n`,
	);

	// Fetch initial job stats
	const { data: stats } = await supabase.rpc("get_match_job_stats");
	if (stats) {
		console.log(`📈 Current job queue status:`);
		stats.forEach((stat: any) => {
			console.log(`   ${stat.status}: ${stat.count}`);
		});
	}

	return insertedCount;
}

// Run the script
triggerMatchGeneration()
	.then((count) => {
		console.log(`\n✅ Script completed. ${count} match jobs created.`);
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Script failed:", error);
		process.exit(1);
	});
