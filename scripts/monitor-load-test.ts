import { createClient } from "@supabase/supabase-js";

/**
 * Monitor 500-User Load Test Progress
 *
 * Real-time monitoring of match job processing and system performance
 */

const SCHOOL = "Columbia University";
const REFRESH_INTERVAL_MS = 10000; // 10 seconds

interface JobStats {
	status: string;
	count: number;
	oldest_job: string;
}

async function monitorLoadTest() {
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	console.log("📊 500-User Load Test Monitor\n");
	console.log(`School: ${SCHOOL}`);
	console.log(`Refresh interval: ${REFRESH_INTERVAL_MS / 1000}s\n`);
	console.log("Press Ctrl+C to stop monitoring\n");
	console.log("=".repeat(60));

	let iteration = 0;

	const monitor = setInterval(async () => {
		iteration++;
		console.log(
			`\n[${new Date().toLocaleTimeString()}] Iteration #${iteration}`,
		);
		console.log("-".repeat(60));

		try {
			// 1. Job queue status
			const { data: jobStats } = await supabase.rpc("get_match_job_stats");

			console.log("\n📋 Match Job Queue:");
			if (jobStats && jobStats.length > 0) {
				jobStats.forEach((stat: JobStats) => {
					console.log(`   ${stat.status.padEnd(12)}: ${stat.count}`);
				});
			} else {
				console.log("   No jobs in queue");
			}

			// 2. Total matches generated
			const { count: totalMatches } = await supabase
				.from("matches")
				.select("*", { count: "exact", head: true });

			console.log(`\n🎯 Total Matches Generated: ${totalMatches || 0}`);

			// 3. Matches in last hour (activity rate)
			const { count: recentMatches } = await supabase
				.from("matches")
				.select("*", { count: "exact", head: true })
				.gte("created_at", new Date(Date.now() - 3600000).toISOString());

			console.log(`📈 Matches (Last Hour): ${recentMatches || 0}`);

			// 4. Error tracking
			const { count: failedJobs } = await supabase
				.from("match_jobs")
				.select("*", { count: "exact", head: true })
				.eq("status", "failed");

			console.log(`❌ Failed Jobs: ${failedJobs || 0}`);

			// 5. Completion check
			const { count: pendingJobs } = await supabase
				.from("match_jobs")
				.select("*", { count: "exact", head: true })
				.eq("status", "pending");

			const { count: processingJobs } = await supabase
				.from("match_jobs")
				.select("*", { count: "exact", head: true })
				.eq("status", "processing");

			const inProgress = (pendingJobs || 0) + (processingJobs || 0);

			if (inProgress === 0) {
				console.log("\n🎉 ALL JOBS COMPLETED!");
				console.log("   Check results and run analysis script.");
				clearInterval(monitor);
				process.exit(0);
			} else {
				console.log(`\n⏳ Jobs remaining: ${inProgress}`);
			}

			console.log("=".repeat(60));
		} catch (error) {
			console.error("❌ Error fetching stats:", error);
		}
	}, REFRESH_INTERVAL_MS);

	// Initial run
	console.log("Starting monitoring...\n");
}

// Run the monitor
monitorLoadTest().catch((error) => {
	console.error("❌ Monitor failed:", error);
	process.exit(1);
});
