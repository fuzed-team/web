import { writeFileSync } from "fs";
import { join } from "path";
import { generateProfileImage } from "@/lib/services/fal-service";
import {
	CHIN_TYPES,
	CLOTHING,
	ETHNICITIES,
	EYE_SHAPES,
	FACE_SHAPES,
	FEMALE_HAIR_STYLES,
	LOCATIONS,
	NOSE_TYPES,
	pick,
	UNIQUE_FEATURES,
	VIBES,
} from "./prompt-data";

/**
 * Test FAL AI Profile Image Generation
 *
 * Quick test to verify FLUX image generation works before running 500 users.
 * Run: npx tsx scripts/generate-500-users/test-single-image.ts
 */

// Dynamic imports AFTER dotenv is loaded
async function main() {
	console.log("🧪 Testing FAL AI FLUX Image Generation\n");

	const gender = "male" as const;

	const params = {
		gender,
		ethnicity: pick(ETHNICITIES),
		hairStyle: pick(FEMALE_HAIR_STYLES),
		clothing: pick(CLOTHING),
		location: pick(LOCATIONS),
		vibe: pick(VIBES),
		// New facial diversity features
		faceShape: pick(FACE_SHAPES),
		noseType: pick(NOSE_TYPES),
		eyeShape: pick(EYE_SHAPES),
		uniqueFeature: pick(UNIQUE_FEATURES),
		chinType: pick(CHIN_TYPES),
	};

	console.log("📝 Generation params:");
	console.log(`   Gender: ${params.gender}`);
	console.log(`   Ethnicity: ${params.ethnicity}`);
	console.log(`   Hair: ${params.hairStyle}`);
	console.log(`   Clothing: ${params.clothing}`);
	console.log(`   Location: ${params.location}`);
	console.log(`   Vibe: ${params.vibe}`);
	console.log(`   Face Shape: ${params.faceShape}`);
	console.log(`   Nose: ${params.noseType}`);
	console.log(`   Eyes: ${params.eyeShape}`);
	console.log(`   Chin: ${params.chinType}`);
	console.log(`   Feature: ${params.uniqueFeature}\n`);

	console.log("🎨 Generating image...");
	const startTime = Date.now();

	try {
		const imageBuffer = await generateProfileImage(params);
		const duration = ((Date.now() - startTime) / 1000).toFixed(2);

		// Save to temp file for inspection
		const outputPath = join(__dirname, `test-output-${Date.now()}.jpg`);
		writeFileSync(outputPath, imageBuffer);

		console.log(`\n✅ Success!`);
		console.log(`   Duration: ${duration}s`);
		console.log(`   Size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
		console.log(`   Saved to: ${outputPath}`);
	} catch (error) {
		console.error("\n❌ Failed:", error);
		process.exit(1);
	}
}

main();
