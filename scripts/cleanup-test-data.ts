import { createClient } from "@supabase/supabase-js";

/**
 * Cleanup Script - Delete All Test Data
 *
 * Removes all test users, faces, matches, and match_jobs
 * created during the 500-user load test.
 *
 * DANGEROUS: This will delete data! Use carefully.
 */

const SCHOOL = "Columbia University";
const TEST_EMAIL_PATTERN = "test-500-%"; // Assuming emails like test-500-1@example.com
const STORAGE_BUCKET = "user-images";
const TEST_FOLDER = "test-500";

async function main() {
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	console.log("🧹 500-User Load Test Cleanup\n");
	console.log("⚠️  WARNING: This will delete ALL test data!\n");

	// Get confirmation
	console.log("Deleting test data for school:", SCHOOL);
	console.log("Proceeding in 5 seconds... (Ctrl+C to cancel)\n");

	await new Promise((resolve) => setTimeout(resolve, 5000));

	try {
		// 1. Get all test profile IDs
		const { data: profiles } = await supabase
			.from("profiles")
			.select("id")
			.eq("school", SCHOOL);

		if (!profiles || profiles.length === 0) {
			console.log("No test profiles found");
			process.exit(0);
		}

		const profileIds = profiles.map((p) => p.id);
		console.log(`Found ${profileIds.length} test profiles\n`);

		// 2. Delete matches (FK constraint)
		console.log("🗑️  Deleting matches...");
		const { error: matchError } = await supabase
			.from("matches")
			.delete()
			.or(
				profileIds
					.map((id) => `face_a.profile_id.eq.${id},face_b.profile_id.eq.${id}`)
					.join(","),
			);

		if (matchError) console.error("Match deletion error:", matchError);
		else console.log("✅ Matches deleted\n");

		// 3. Delete match_jobs
		console.log("🗑️  Deleting match_jobs...");
		const { error: jobError } = await supabase
			.from("match_jobs")
			.delete()
			.in("user_id", profileIds);

		if (jobError) console.error("Job deletion error:", jobError);
		else console.log("✅ Match jobs deleted\n");

		// 4. Delete faces
		console.log("🗑️  Deleting faces...");
		const { error: faceError } = await supabase
			.from("faces")
			.delete()
			.in("profile_id", profileIds);

		if (faceError) console.error("Face deletion error:", faceError);
		else console.log("✅ Faces deleted\n");

		// 5. Delete profiles
		console.log("🗑️  Deleting profiles...");
		const { error: profileError } = await supabase
			.from("profiles")
			.delete()
			.eq("school", SCHOOL);

		if (profileError) console.error("Profile deletion error:", profileError);
		else console.log("✅ Profiles deleted\n");

		// 6. Delete storage files
		console.log("🗑️  Deleting storage files...");
		const { data: files } = await supabase.storage
			.from(STORAGE_BUCKET)
			.list(TEST_FOLDER);

		if (files && files.length > 0) {
			const filePaths = files.map((f) => `${TEST_FOLDER}/${f.name}`);
			const { error: storageError } = await supabase.storage
				.from(STORAGE_BUCKET)
				.remove(filePaths);

			if (storageError) console.error("Storage deletion error:", storageError);
			else console.log(`✅ Deleted ${files.length} storage files\n`);
		}

		console.log("🎉 Cleanup complete!\n");
	} catch (error) {
		console.error("❌ Cleanup failed:", error);
		process.exit(1);
	}
}

main();
