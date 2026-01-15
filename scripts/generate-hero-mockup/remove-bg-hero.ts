#!/usr/bin/env tsx

/**
 * Remove Background from Hero Mockup using fal.ai
 *
 * Uses fal-ai/bria/background/remove (Bria RMBG 2.0) to remove background from the hero mockup image.
 * This model is trained exclusively on licensed data for safe commercial use and provides better results.
 *
 * Usage:
 *   bun run scripts/remove-bg-hero.ts
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fal } from "@fal-ai/client";

// Configuration
const INPUT_IMAGE = "./public/images/hero-mockup.png";
const OUTPUT_IMAGE = "./public/images/hero-mockup-nobg.png";

// Get API key from environment
const FAL_KEY = process.env.FAL_AI_API_KEY;

if (!FAL_KEY) {
	console.error("❌ Error: Missing FAL_AI_API_KEY environment variable");
	console.error("Please set FAL_AI_API_KEY in your .env file");
	process.exit(1);
}

// Configure fal client
fal.config({
	credentials: FAL_KEY,
});

interface BriaRembgResult {
	image: {
		url: string;
		content_type: string;
		file_name: string;
		file_size: number;
		width: number;
		height: number;
	};
}

async function removeBackground(): Promise<void> {
	console.log("═══════════════════════════════════════════════");
	console.log("🎨 Remove Background - Hero Mockup (Bria RMBG 2.0)");
	console.log("═══════════════════════════════════════════════");
	console.log(`📁 Input: ${INPUT_IMAGE}`);
	console.log(`📁 Output: ${OUTPUT_IMAGE}`);
	console.log("");

	try {
		// Read the input image and convert to base64 data URI
		console.log("📤 Uploading image to fal.ai...");
		const imageBuffer = await readFile(INPUT_IMAGE);
		const base64Image = imageBuffer.toString("base64");
		const dataUri = `data:image/png;base64,${base64Image}`;

		// Call fal.ai Bria RMBG 2.0 API
		console.log("🔄 Processing with Bria RMBG 2.0 background removal...\n");
		const startTime = Date.now();

		const result = await fal.subscribe("fal-ai/bria/background/remove", {
			input: {
				image_url: dataUri,
			},
			logs: true,
			onQueueUpdate: (update) => {
				if (update.status === "IN_PROGRESS" && update.logs) {
					update.logs.map((log) => log.message).forEach(console.log);
				}
			},
		});

		const duration = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log(`\n✅ Background removed in ${duration}s`);

		// Download the result image
		const data = result.data as BriaRembgResult;
		console.log(
			`📦 Result: ${data.image.width}x${data.image.height} (${(data.image.file_size / 1024 / 1024).toFixed(2)} MB)`,
		);

		// Fetch the result image
		console.log("📥 Downloading result image...");
		const response = await fetch(data.image.url);
		const resultBuffer = Buffer.from(await response.arrayBuffer());

		// Save to output path
		const dir = dirname(OUTPUT_IMAGE);
		await mkdir(dir, { recursive: true });
		await writeFile(OUTPUT_IMAGE, resultBuffer);

		console.log(`💾 Saved to: ${OUTPUT_IMAGE}`);

		console.log("\n═══════════════════════════════════════════════");
		console.log("✨ Success! Background removed.");
		console.log("═══════════════════════════════════════════════");
		console.log("Next: Update right-side.tsx to use hero-mockup-nobg.png");
	} catch (error: any) {
		console.error("\n❌ Error removing background:");
		console.error(error.message);
		process.exit(1);
	}
}

// Run
removeBackground().catch((error) => {
	console.error("\n💥 Fatal error:", error);
	process.exit(1);
});
