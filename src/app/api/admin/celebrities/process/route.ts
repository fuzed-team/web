import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { withAdminSession } from "@/lib/middleware/with-admin-session";
import { analyzeAdvancedFace } from "@/lib/services/ai-service";
import { removeBackground } from "@/lib/services/fal-service";
import { sanitizeFilename } from "@/lib/utils/sanitize";

interface ProcessRequest {
	name: string;
	bio: string;
	category: string;
	gender: "male" | "female";
	imageUrl: string;
}

export const POST = withAdminSession(async ({ request, supabase }) => {
	try {
		const body: ProcessRequest = await request.json();
		const { name, bio, category, gender, imageUrl } = body;

		if (!name || !imageUrl) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// 1. Download image
		const imageResponse = await fetch(imageUrl);
		if (!imageResponse.ok) {
			throw new Error("Failed to download image");
		}
		const originalBuffer = Buffer.from(await imageResponse.arrayBuffer());

		// 2. Generate hash and check duplicate FIRST (save FAL credits)
		const imageHash = createHash("md5").update(originalBuffer).digest("hex");

		const { data: existing } = await supabase
			.from("celebrities")
			.select("id, name")
			.eq("image_hash", imageHash)
			.maybeSingle();

		if (existing) {
			return NextResponse.json(
				{ success: true, skipped: true, message: `${name} already exists` },
				{ status: 200 },
			);
		}

		// 3. Upload original to Supabase Storage FIRST (get public URL for FAL.AI)
		const baseName = sanitizeFilename(name);
		const originalFilename = `${baseName}.jpg`;
		const originalStoragePath = `celebrities/${category}/original/${originalFilename}`;

		const { error: originalUploadError } = await supabase.storage
			.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
			.upload(originalStoragePath, originalBuffer, {
				contentType: "image/jpeg",
				upsert: true,
				cacheControl: "3600",
			});

		if (originalUploadError) {
			console.error("Original upload error:", originalUploadError);
			throw new Error("Failed to upload original image");
		}

		// 4. Remove background using FAL.AI (uses FAL storage internally)
		// Note: Skipping image expansion as it's unreliable for ensuring complete shoulders
		let processedBuffer: Buffer | null = null;
		try {
			processedBuffer = await removeBackground(originalBuffer);
			console.log(`Background removed for: ${name}`);
		} catch (error) {
			console.error("Background removal failed:", error);
			// Continue without background removal
		}

		// 6. AI Analysis (use original image for better face detection)
		let analysis: any;
		try {
			analysis = await analyzeAdvancedFace(originalBuffer);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return NextResponse.json(
				{ error: `AI analysis failed: ${errorMessage}` },
				{ status: 500 },
			);
		}

		if (!analysis.face_detected) {
			return NextResponse.json(
				{ error: "No face detected in image" },
				{ status: 400 },
			);
		}

		// Quality check
		if (analysis.quality.overall < 0.5) {
			return NextResponse.json(
				{
					error: `Image quality too low: ${analysis.quality.overall.toFixed(2)}`,
				},
				{ status: 400 },
			);
		}

		// 7. Upload processed image (if background removal succeeded)
		let processedStoragePath: string | null = null;
		if (processedBuffer) {
			const processedFilename = `${baseName}.png`;
			processedStoragePath = `celebrities/${category}/${processedFilename}`;

			const { error: processedUploadError } = await supabase.storage
				.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
				.upload(processedStoragePath, processedBuffer, {
					contentType: "image/png",
					upsert: true,
					cacheControl: "3600",
				});

			if (processedUploadError) {
				console.error("Processed upload error:", processedUploadError);
				processedStoragePath = null; // Fallback to original
			}
		}

		// 8. Save to database
		const { error: dbError } = await supabase.from("celebrities").upsert(
			{
				name,
				bio,
				category,
				gender,
				image_path: processedStoragePath || originalStoragePath,
				original_image_path: originalStoragePath,
				embedding: `[${analysis.embedding.join(",")}]`,
				image_hash: imageHash,
				age: analysis.age,
				symmetry_score: analysis.symmetry_score,
				skin_tone_lab: analysis.skin_tone.dominant_color_lab,
				expression: analysis.expression.dominant,
				geometry_ratios: analysis.geometry,
				quality_score: analysis.quality.overall,
				blur_score: analysis.quality.blur_score,
				illumination_score: analysis.quality.illumination,
				landmarks_68: analysis.landmarks_68,
				pose: analysis.pose,
				emotion_scores: analysis.expression.emotions,
				expression_confidence: analysis.expression.confidence,
				analyzed_at: new Date().toISOString(),
			},
			{
				onConflict: "image_hash",
				ignoreDuplicates: false,
			},
		);

		if (dbError) {
			console.error("DB error:", dbError);
			return NextResponse.json(
				{ error: `Database error: ${dbError.message}` },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			name,
			quality: analysis.quality.overall,
		});
	} catch (error: unknown) {
		console.error("Process error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Processing failed";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
});
