import { createClient } from "@supabase/supabase-js";
import { analyzeAdvancedFace } from "@/lib/services/ai-service";
import { generateProfileImage } from "@/lib/services/fal-service";
import {
	CHIN_TYPES,
	CLOTHING,
	ETHNICITIES,
	EYE_SHAPES,
	FACE_SHAPES,
	FEMALE_HAIR_STYLES,
	LOCATIONS,
	MALE_HAIR_STYLES,
	NOSE_TYPES,
	pick,
	UNIQUE_FEATURES,
	VIBES,
} from "./prompt-data";

/**
 * Generate and Analyze 500 Faces using FAL AI FLUX + Replicate
 *
 * This script:
 * 1. Generates AI face images using FAL FLUX/dev
 * 2. Analyzes each face through Replicate (existing analyzeAdvancedFace function)
 * 3. Inserts complete face records with all 6-factor attributes
 * 4. Updates profiles with default_face_id
 *
 * Cost: ~$12.50 (500 × $0.025 FLUX) + ~$0.11 (500 × $0.00022 analysis)
 * Time: ~30-40 minutes (500 × 4s + overhead)
 */

const SCHOOL = "Columbia University";
const STORAGE_BUCKET = "user-images";
const TEST_FOLDER = "test-500";

// Progress tracking
let successCount = 0;
let errorCount = 0;

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate face image using FAL AI FLUX with combinatorial prompts
 */
async function generateFaceImage(gender: "male" | "female"): Promise<Buffer> {
	return generateProfileImage({
		gender,
		ethnicity: pick(ETHNICITIES),
		hairStyle: pick(gender === "male" ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES),
		clothing: pick(CLOTHING),
		location: pick(LOCATIONS),
		vibe: pick(VIBES),
		// Facial diversity features
		faceShape: pick(FACE_SHAPES),
		noseType: pick(NOSE_TYPES),
		eyeShape: pick(EYE_SHAPES),
		uniqueFeature: pick(UNIQUE_FEATURES),
		chinType: pick(CHIN_TYPES),
	});
}

async function processFaceWithRetry(
	profile: any,
	supabase: any,
	retryCount = 0,
): Promise<boolean> {
	try {
		// 1. Generate AI face image matching profile gender
		console.log(`🎨 Generating ${profile.gender} AI face image...`);
		const imageBuffer = await generateFaceImage(profile.gender);

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
