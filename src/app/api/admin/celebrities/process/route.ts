import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { withAdminSession } from "@/lib/middleware/with-admin-session";
import { analyzeAdvancedFace } from "@/lib/services/ai-service";

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
		const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

		// 2. Generate hash for deduplication
		const imageHash = createHash("md5").update(imageBuffer).digest("hex");

		// Check if already exists
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

		// 3. AI Analysis
		let analysis: any;
		try {
			analysis = await analyzeAdvancedFace(imageBuffer);
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

		// 4. Upload to Supabase Storage
		const filename = `${name.toLowerCase().replace(/\s+/g, "-")}.jpg`;
		const storagePath = `celebrities/${category}/${filename}`;

		const { error: uploadError } = await supabase.storage
			.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
			.upload(storagePath, imageBuffer, {
				contentType: "image/jpeg",
				upsert: true,
				cacheControl: "3600",
			});

		if (uploadError) {
			console.error("Upload error:", uploadError);
			// Continue anyway, might be duplicate
		}

		// 5. Save to database
		const { error: dbError } = await supabase.from("celebrities").upsert(
			{
				name,
				bio,
				category,
				gender,
				image_path: storagePath,
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
