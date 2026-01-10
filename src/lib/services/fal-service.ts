/**
 * FAL.AI Service Client - Image Processing
 *
 * This client communicates with FAL.AI for image processing tasks:
 * - Background removal (Birefnet)
 * - Baby image generation (nano-banana/edit)
 */

import { fal } from "@fal-ai/client";
import { env } from "@/config/env";

// Configure FAL client globally
fal.config({ credentials: env.FAL_AI_API_KEY });

interface BirefnetResult {
	data: {
		image: {
			url: string;
			width: number;
			height: number;
			content_type: string;
		};
	};
}

/**
 * Remove background from image using FAL.AI Birefnet model
 *
 * Uses the Portrait model which is optimized for human faces.
 * Returns PNG with transparent background.
 *
 * @param imageBuffer - Buffer of the image
 * @returns Buffer of the processed image (PNG format)
 * @throws Error if background removal fails
 */
export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
	// Upload to FAL storage (free, fast, auto-cleanup)
	const uint8Array = new Uint8Array(imageBuffer);
	const file = new File([uint8Array], "image.png", { type: "image/png" });
	const uploadedUrl = await fal.storage.upload(file);

	const result = (await fal.subscribe("fal-ai/birefnet", {
		input: {
			image_url: uploadedUrl,
			model: "Portrait",
			operating_resolution: "1024x1024",
			output_format: "png",
			refine_foreground: true,
		},
	})) as BirefnetResult;

	// Download processed image from FAL.AI
	const response = await fetch(result.data.image.url);
	if (!response.ok) {
		throw new Error("Failed to download processed image from FAL.AI");
	}

	return Buffer.from(await response.arrayBuffer());
}

interface BabyGenerationParams {
	prompt: string;
	imageUrls: [string, string];
}

interface BabyGenerationResult {
	images: Array<{ url: string }>;
}

/**
 * Generate a baby image from two parent face images using FAL.AI
 *
 * @param params - Object containing prompt and imageUrls
 * @param params.prompt - The dynamic prompt building the baby features
 * @param params.imageUrls - Array of two image URLs (usually signed URLs)
 * @returns The URL of the generated baby image
 * @throws Error if generation fails
 */
export async function generateBabyImage({
	prompt,
	imageUrls,
}: BabyGenerationParams): Promise<string> {
	const result = (await fal.subscribe(env.FAL_BABY_MODEL_ID, {
		input: {
			prompt,
			image_urls: imageUrls,
			num_images: 1,
			guidance_scale: 6.5 + Math.random() * 2, // 6.5-8.5 range
			num_inference_steps: 45 + Math.floor(Math.random() * 10), // 45-55
			seed: Math.floor(Math.random() * 1000000), // Random seed
		},
	})) as { data: BabyGenerationResult };

	const babyImageUrl = result.data.images?.[0]?.url;

	if (!babyImageUrl) {
		throw new Error("No image URL returned from FAL.AI");
	}

	return babyImageUrl;
}

// =============================================================================
// Profile Image Generation (FLUX)
// =============================================================================

interface ProfileImageParams {
	gender: "male" | "female";
	ethnicity: string;
	hairStyle: string;
	clothing: string;
	location: string;
	vibe: string;
	// Facial diversity features
	faceShape: string;
	noseType: string;
	eyeShape: string;
	uniqueFeature: string;
	chinType: string;
}

interface NanoBananaResult {
	data: {
		images: Array<{ url: string }>;
	};
}

/**
 * Generate AI profile image using FAL.AI nano-banana-pro
 *
 * Uses combinatorial prompts with facial features for maximum diversity.
 * Faster and more cost-effective than FLUX.
 *
 * @param params - Object containing appearance attributes
 * @returns Buffer of the generated image
 * @throws Error if generation fails
 */
export async function generateProfileImage(
	params: ProfileImageParams,
): Promise<Buffer> {
	// Prompt with specific facial features for diversity
	const prompt = `Candid portrait photo of a ${params.ethnicity} ${params.gender}, age 20-22,
		${params.faceShape}, ${params.chinType}, ${params.noseType}, ${params.eyeShape}, ${params.uniqueFeature},
		${params.hairStyle}, wearing ${params.clothing},
		${params.location} background, ${params.vibe} expression,
		natural lighting, clear healthy skin,
		casual relaxed pose, looking at camera,
		authentic natural photo, realistic person`;

	const result = (await fal.subscribe("fal-ai/nano-banana-pro", {
		input: {
			prompt,
			aspect_ratio: "3:4",
			num_images: 1,
			resolution: "1K",
			output_format: "png",
		},
	})) as NanoBananaResult;

	const imageUrl = result.data.images?.[0]?.url;

	if (!imageUrl) {
		throw new Error("No image URL returned from FAL.AI nano-banana-pro");
	}

	// Download the generated image
	const response = await fetch(imageUrl);
	if (!response.ok) {
		throw new Error("Failed to download generated image from FAL.AI");
	}

	return Buffer.from(await response.arrayBuffer());
}
