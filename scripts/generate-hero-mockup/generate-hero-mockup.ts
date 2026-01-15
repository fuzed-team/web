#!/usr/bin/env tsx

/**
 * Hero Section Mockup Editor using Gemini Image Editing
 *
 * Edits an existing image based on text prompts.
 *
 * Usage:
 *   bun run gen:hero
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { GoogleGenAI } from "@google/genai";

// Configuration
const DEFAULT_OUTPUT = "./public/images/hero-mockup.png";
const INPUT_IMAGE =
	"/Users/ngocla/.gemini/antigravity/brain/ef1744f1-5795-40e4-aa53-7acc976d6866/uploaded_image_1768402419992.png";
const apiKey = "AIzaSyA6eJuHH60CIdWuHF11ZedhLtAqdZYiXj8";
const outputPath = DEFAULT_OUTPUT;

// Validate API key
if (!apiKey) {
	console.error("❌ Error: Missing Gemini API key\n");
	process.exit(1);
}

// Edit prompt - describes changes to make to the image
const EDIT_PROMPT = `Edit this image with the following changes:

1. Change the FIRST "Other user matches" text (the one in the middle of the phone, above Arina and Matha O.) to "University matches"
2. REMOVE the SECOND "Other user matches" text label at the bottom of the phone screen completely (delete the text only, keep everything else)
3. Replace the baby photo (small square image of a baby) that is above the man named "Genroiel" in the left floating card with a photo of a young woman instead
4. Remove the "Celebrity match" text labels that appear below "Arina" and "Matha O." - just show their names without any subtitle
5. In the Celebrity section at the top, make Ariana Grande's photo fill the entire width of the celebrity card by cropping/zooming in - there should be NO other celebrity photo visible, not even partially. Center Ariana Grande in the card.
6. Change the background to pure white (#FFFFFF) while keeping the soft purple/pink gradient blobs visible on top of the white background

Keep everything else exactly the same - the phone mockup, the UI, the other people's photos, the purple and pink gradient blobs, and the overall layout.`;

/**
 * Edit image using Gemini Image Editing API
 */
async function editImage(
	apiKey: string,
	imagePath: string,
	prompt: string,
): Promise<Buffer> {
	console.log("🎨 Editing image with Gemini API...\n");

	// Read the input image
	const imageData = await readFile(imagePath);
	const base64Image = imageData.toString("base64");

	// Initialize the Google Gemini AI client
	const ai = new GoogleGenAI({ apiKey });

	// Use generateContent with both text and image
	const response = await ai.models.generateContent({
		model: "gemini-3-pro-image-preview",
		contents: [
			{
				text: prompt,
			},
			{
				inlineData: {
					mimeType: "image/png",
					data: base64Image,
				},
			},
		],
		config: {
			imageConfig: {
				aspectRatio: "1:1",
			},
		},
	});

	// Check for candidates and parts
	if (!response.candidates || !response.candidates[0]?.content?.parts) {
		throw new Error("No response content returned from API");
	}

	// Find the image part in the response
	for (const part of response.candidates[0].content.parts) {
		if (part.inlineData) {
			const imageData = part.inlineData.data;
			if (!imageData) {
				throw new Error("Image data is empty");
			}
			return Buffer.from(imageData, "base64");
		}
	}

	throw new Error("No image data found in response");
}

/**
 * Save image buffer to file
 */
async function saveImage(imageBuffer: Buffer, path: string): Promise<string> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const dynamicPath = path.replace(/(\.[^.]+)$/, `-${timestamp}$1`);

	// Ensure directory exists
	const dir = dirname(dynamicPath);
	await mkdir(dir, { recursive: true });

	// Write file
	await writeFile(dynamicPath, imageBuffer);
	return dynamicPath;
}

/**
 * Main function
 */
async function main() {
	console.log("═══════════════════════════════════════════════");
	console.log("🚀 Gemini Hero Mockup Editor");
	console.log("═══════════════════════════════════════════════");
	console.log(`📁 Input: ${INPUT_IMAGE}`);
	console.log(`📁 Output: ${outputPath}`);
	console.log("\n📝 Edit prompt:");
	console.log(EDIT_PROMPT);
	console.log("");

	try {
		// Edit image
		const startTime = Date.now();
		const imageBuffer = await editImage(apiKey, INPUT_IMAGE, EDIT_PROMPT);
		const duration = ((Date.now() - startTime) / 1000).toFixed(1);

		console.log(`✅ Image edited in ${duration}s`);
		console.log(
			`📦 Image size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)} MB\n`,
		);

		// Save image
		const savedPath = await saveImage(imageBuffer, outputPath);
		console.log(`💾 Saved to: ${savedPath}`);

		console.log("\n═══════════════════════════════════════════════");
		console.log("✨ Success!");
		console.log("═══════════════════════════════════════════════");
	} catch (error: any) {
		console.error("\n❌ Error editing image:");
		console.error(error.message);
		process.exit(1);
	}
}

// Run
main().catch((error) => {
	console.error("\n💥 Fatal error:", error);
	process.exit(1);
});
