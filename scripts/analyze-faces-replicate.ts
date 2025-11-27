import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import { analyzeAdvancedFace } from "@/lib/services/ai-service";

/**
 * Generate and Analyze 500 Faces using Replicate
 *
 * This script:
 * 1. Fetches face images from ThisPersonDoesNotExist
 * 2. Analyzes each face through Replicate (existing analyzeAdvancedFace function)
 * 3. Inserts complete face records with all 6-factor attributes
 * 4. Updates profiles with default_face_id
 *
 * Cost: ~$0.11 (500 × $0.00022)
 * Time: ~25-30 minutes (500 × 3s + overhead)
 */

const SCHOOL = "Columbia University";
const STORAGE_BUCKET = "user-images";
const TEST_FOLDER = "test-500";

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Progress tracking
let totalProcessed = 0;
let successCount = 0;
let errorCount = 0;
const lowQualityCount = 0;

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFaceImage(gender: "male" | "female"): Promise<Buffer> {
	// Use randomuser.me API - provides gender-specific photos with good face detection
	// Age range 18-25 is automatically more likely with this API
	const response = await fetch(
		`https://randomuser.me/api/?gender=${gender}&nat=us,gb,ca,au&noinfo`,
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch from randomuser.me: ${response.statusText}`,
		);
	}

	const data = (await response.json()) as {
		results: Array<{ picture: { large: string } }>;
	};
	const photoUrl = data.results[0].picture.large; // Large size for better analysis

	// Download the actual image
	const imageResponse = await fetch(photoUrl);
	if (!imageResponse.ok) {
		throw new Error(`Failed to download image: ${imageResponse.statusText}`);
	}

	const arrayBuffer = await imageResponse.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

async function processFaceWithRetry(
	profile: any,
	supabase: any,
	retryCount = 0,
): Promise<boolean> {
	try {
		// 1. Fetch face image matching profile gender
		console.log(`📸 Fetching ${profile.gender} face image...`);
		const imageBuffer = await fetchFaceImage(profile.gender);

		// Small delay to avoid rate limits
		await sleep(500);

		// 2. Upload to Supabase Storage
		const fileName = `${TEST_FOLDER}/${profile.id}.jpg`;
		const { error: uploadError } = await supabase.storage
			.from(STORAGE_BUCKET)
			.upload(fileName, imageBuffer, {
				contentType: "image/jpeg",
				upsert: true,
			});

		if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

		// 3. Analyze face using Replicate (ALL 6 factors!)
		console.log(`🔍 Analyzing face via Replicate...`);
		const analysis = await analyzeAdvancedFace(imageBuffer);

		// 4. Quality score recorded but no rejection (all faces accepted)

		// 5. Insert face record with ALL attributes
		const { data: faceData, error: faceError } = await supabase
			.from("faces")
			.insert({
				profile_id: profile.id,
				image_path: fileName,
				// Core attributes
				embedding: analysis.embedding,
				age: analysis.age,
				gender: analysis.gender,
				// Quality metrics
				quality_score: analysis.quality.overall,
				blur_score: analysis.quality.blur_score,
				illumination_score: analysis.quality.illumination,
				// Aesthetic features
				symmetry_score: analysis.symmetry_score,
				skin_tone_lab: analysis.skin_tone.dominant_color_lab,
				// Expression
				expression: analysis.expression.dominant,
				expression_confidence: analysis.expression.confidence,
				emotion_scores: analysis.expression.emotions,
				// Geometry
				geometry_ratios: analysis.geometry,
				// Technical
				landmarks_68: analysis.landmarks_68,
				pose: analysis.pose,
				analyzed_at: new Date().toISOString(),
			})
			.select("id")
			.single();

		if (faceError) throw new Error(`Face insert failed: ${faceError.message}`);

		// 6. Update profile's default_face_id
		const { error: updateError } = await supabase
			.from("profiles")
			.update({ default_face_id: faceData.id })
			.eq("id", profile.id);

		if (updateError)
			throw new Error(`Profile update failed: ${updateError.message}`);

		console.log(
			`✅ Success! Age: ${analysis.age}, Expression: ${analysis.expression.dominant}, Quality: ${analysis.quality.overall.toFixed(2)}`,
		);
		successCount++;
		return true;
	} catch (error) {
		console.error(
			`❌ Error: ${error instanceof Error ? error.message : error}`,
		);
		errorCount++;
		return false;
	}
}

async function main() {
	const supabase = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	console.log("🚀 500-User Face Analysis via Replicate\n");
	console.log(`Cost estimate: ~$0.11 (500 × $0.00022)`);
	console.log(`Time estimate: ~25-30 minutes\n`);

	// Fetch all test users without default_face_id
	const { data: profiles, error: fetchError } = await supabase
		.from("profiles")
		.select("id, name, gender")
		.eq("school", SCHOOL)
		.is("default_face_id", null);

	if (fetchError) {
		console.error("❌ Error fetching profiles:", fetchError);
		process.exit(1);
	}

	if (!profiles || profiles.length === 0) {
		console.log("ℹ️  No profiles found needing faces");
		console.log("   Run generate-500-test-users.ts first!");
		process.exit(0);
	}

	console.log(`📊 Found ${profiles.length} users needing face analysis\n`);

	const startTime = Date.now();

	// Process each profile
	for (let i = 0; i < profiles.length; i++) {
		const profile = profiles[i];
		totalProcessed++;

		console.log(
			`\n[${i + 1}/${profiles.length}] Processing: ${profile.name} (${profile.gender})`,
		);
		console.log("-".repeat(60));

		await processFaceWithRetry(profile, supabase);

		// Progress summary every 10 users
		if ((i + 1) % 10 === 0) {
			const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
			const avgTime = (Date.now() - startTime) / (i + 1) / 1000;
			const remaining = ((profiles.length - (i + 1)) * avgTime) / 60;

			console.log(`\n📈 Progress: ${i + 1}/${profiles.length}`);
			console.log(`   ✅ Success: ${successCount}`);
			console.log(`   ❌ Errors: ${errorCount}`);
			console.log(`   ⚠️  Low Quality Retries: ${lowQualityCount}`);
			console.log(`   ⏱️  Elapsed: ${elapsed}min`);
			console.log(`   ⏳ Est. Remaining: ${remaining.toFixed(1)}min\n`);
		}
	}

	const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
	const estimatedCost = (successCount * 0.00022).toFixed(4);

	console.log("\n" + "=".repeat(60));
	console.log("🎉 Face Analysis Complete!\n");
	console.log(`✅ Successful: ${successCount}/${profiles.length}`);
	console.log(`❌ Failed: ${errorCount}`);
	console.log(`⚠️  Low Quality Retries: ${lowQualityCount}`);
	console.log(`⏱️  Total Time: ${totalTime} minutes`);
	console.log(`💰 Estimated Cost: $${estimatedCost}\n`);

	console.log("Next steps:");
	console.log("1. Run: bun run scripts/trigger-match-jobs.ts");
	console.log("2. Monitor: bun run scripts/monitor-load-test.ts\n");

	process.exit(errorCount > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
