import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { withSession } from "@/lib/middleware/with-session";
import { generateBabyImage } from "@/lib/services/fal-service";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
	buildCelebrityBabyPrompt,
	type CelebrityFeatures,
	type FaceFeatures,
} from "@/lib/utils/baby-prompt-builder";
import {
	checkDailyLimit,
	incrementDailyUsage,
} from "@/lib/utils/rate-limiting";

/**
 * POST /api/baby/celebrity - Generate baby image with a celebrity
 *
 * Request body:
 *   - celebrity_match_id: UUID of the celebrity match
 *
 * Workflow:
 * 1. Authenticate user (via withSession)
 * 2. Get celebrity match details (user's face + celebrity)
 * 3. Get both face images (user from user_images, celebrity from celebrity_images)
 * 4. Call FAL.AI to generate baby image
 * 5. Save baby record to database (with celebrity_match_id)
 * 6. Return baby details
 */
export const POST = withSession(async ({ request, supabase, session }) => {
	const body = await request.json();
	const { celebrity_match_id } = body;

	if (!celebrity_match_id) {
		return NextResponse.json(
			{ error: "celebrity_match_id is required" },
			{ status: 400 },
		);
	}

	// Check daily baby generation limit
	try {
		const limitCheck = await checkDailyLimit(
			supabaseAdmin,
			session.user.id,
			"baby_generations",
		);

		if (!limitCheck.allowed) {
			return NextResponse.json(
				{
					error: "Daily limit reached",
					message: `You've reached your daily limit of ${limitCheck.limit} baby generations. Resets at midnight UTC.`,
					limit: limitCheck.limit,
					current: limitCheck.current,
					resetAt: limitCheck.resetAt,
					type: "baby_generation",
				},
				{ status: 429 },
			);
		}
	} catch (error) {
		console.error("Error checking rate limit:", error);
		// Allow the request to proceed if rate limit check fails (fail open)
	}

	// Get celebrity match details with face and celebrity info
	const { data: celebMatch, error: matchError } = await supabase
		.from("celebrity_matches")
		.select(`
			id,
			similarity_score,
			face:faces!celebrity_matches_face_id_fkey (
				id,
				image_path,
				skin_tone_lab,
				geometry_ratios,
				expression,
				age,
				gender,
				profile:profiles!faces_profile_id_fkey (
					id,
					name,
					gender
				)
			),
			celebrity:celebrities!celebrity_matches_celebrity_id_fkey (
				id,
				name,
				image_path,
				skin_tone_lab,
				geometry_ratios,
				expression,
				age,
				gender
			)
		`)
		.eq("id", celebrity_match_id)
		.single();

	if (matchError || !celebMatch) {
		console.error("Celebrity match not found:", matchError);
		return NextResponse.json(
			{ error: "Celebrity match not found" },
			{ status: 404 },
		);
	}

	// Type assertion for Supabase response
	const matchData = celebMatch as any;
	const userFace = Array.isArray(matchData.face)
		? matchData.face[0]
		: matchData.face;
	const celebrity = Array.isArray(matchData.celebrity)
		? matchData.celebrity[0]
		: matchData.celebrity;

	if (!userFace || !celebrity) {
		return NextResponse.json(
			{ error: "Face or celebrity data not found" },
			{ status: 404 },
		);
	}

	// Verify user owns this face
	const userProfile = Array.isArray(userFace.profile)
		? userFace.profile[0]
		: userFace.profile;
	if (userProfile?.id !== session.user.id) {
		return NextResponse.json(
			{ error: "Unauthorized: This celebrity match belongs to another user" },
			{ status: 403 },
		);
	}

	// Get signed URLs for both images
	// Get signed URL for user image (private)
	const { data: userData, error: userImageError } = await supabase.storage
		.from(STORAGE_BUCKETS.USER_IMAGES)
		.createSignedUrl(userFace.image_path, env.SUPABASE_SIGNED_URL_TTL);

	// Get public URL for celebrity image (public bucket)
	const { data: celebrityData } = supabase.storage
		.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
		.getPublicUrl(celebrity.image_path);

	if (userImageError || !userData?.signedUrl || !celebrityData.publicUrl) {
		console.error("Error getting image URLs:", { userImageError });
		return NextResponse.json(
			{ error: "Failed to get face images" },
			{ status: 500 },
		);
	}

	// Generate dynamic prompt using face features
	const userFaceFeatures: FaceFeatures = {
		skin_tone_lab: userFace.skin_tone_lab,
		geometry_ratios: userFace.geometry_ratios,
		expression: userFace.expression,
		age: userFace.age,
		gender: userFace.gender,
	};

	const celebrityFeatures: CelebrityFeatures = {
		skin_tone_lab: celebrity.skin_tone_lab,
		geometry_ratios: celebrity.geometry_ratios,
		expression: celebrity.expression,
		age: celebrity.age,
		gender: celebrity.gender,
		name: celebrity.name,
	};

	const dynamicPrompt = buildCelebrityBabyPrompt(
		userFaceFeatures,
		celebrityFeatures,
	);

	// Generate baby image with FAL.AI
	const babyImageUrl = await generateBabyImage({
		prompt: dynamicPrompt,
		imageUrls: [userData.signedUrl, celebrityData.publicUrl],
	});

	// Save baby record to database (with celebrity_match_id instead of match_id)
	const { data: baby, error: babyError } = await supabaseAdmin
		.from("babies")
		.insert({
			celebrity_match_id: celebrity_match_id,
			image_url: babyImageUrl,
			generated_by_profile_id: session.user.id,
		})
		.select()
		.single();

	if (babyError) {
		console.error("Database error:", babyError);
		throw new Error(`Failed to save baby record: ${babyError.message}`);
	}

	// Increment daily usage counter (after successful generation)
	try {
		await incrementDailyUsage(
			supabaseAdmin,
			session.user.id,
			"baby_generations",
		);
	} catch (error) {
		console.error("Error incrementing usage counter:", error);
		// Don't fail the request if counter increment fails
	}

	return NextResponse.json(
		{
			id: baby.id,
			celebrity_match_id: baby.celebrity_match_id,
			image_url: baby.image_url,
			created_at: baby.created_at,
			celebrity: {
				id: celebrity.id,
				name: celebrity.name,
			},
			user: {
				id: userProfile.id,
				name: userProfile.name,
			},
		},
		{ status: 201 },
	);
});

/**
 * GET /api/baby/celebrity?celebrity_match_id=xxx - Get baby for a celebrity match
 *
 * Returns the baby if one exists for the given celebrity match.
 */
export const GET = withSession(async ({ session, searchParams }) => {
	const celebrity_match_id = searchParams.celebrity_match_id;

	if (!celebrity_match_id) {
		return NextResponse.json(
			{ error: "celebrity_match_id query parameter is required" },
			{ status: 400 },
		);
	}

	// Get baby for this celebrity match (most recent if multiple)
	const { data: baby, error: babyError } = await supabaseAdmin
		.from("babies")
		.select(`
			id,
			celebrity_match_id,
			image_url,
			created_at,
			generated_by_profile_id
		`)
		.eq("celebrity_match_id", celebrity_match_id)
		.eq("generated_by_profile_id", session.user.id)
		.order("created_at", { ascending: false })
		.limit(1)
		.single();

	if (babyError) {
		if (babyError.code === "PGRST116") {
			// No baby found
			return NextResponse.json({ baby: null });
		}
		throw babyError;
	}

	return NextResponse.json({
		baby: {
			id: baby.id,
			celebrity_match_id: baby.celebrity_match_id,
			image_url: baby.image_url,
			created_at: baby.created_at,
		},
	});
});
