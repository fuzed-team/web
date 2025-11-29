import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/matches/celebrity/featured?face_id=<uuid>
 *
 * Returns the celebrity of the day with match score for a specific face.
 *
 * Query Parameters:
 * - face_id (required): The UUID of the user's face to match with
 *
 * Features:
 * - Single celebrity shown to all users daily
 * - Auto-rotates at midnight UTC
 * - Uses 6-factor advanced matching algorithm
 * - Pre-computed matches from celebrity_matches table
 * - On-demand calculation if no match exists
 *
 * @returns Celebrity info with similarity score for the specified face
 */
export async function GET(request: Request) {
	const supabase = await createClient();

	// Authenticate user
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get face_id from query params
	const { searchParams } = new URL(request.url);
	const faceId = searchParams.get("face_id");

	if (!faceId) {
		return NextResponse.json(
			{ error: "face_id query parameter is required" },
			{ status: 400 },
		);
	}

	// Get user's profile (profiles.id = auth.users.id)
	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("id, gender")
		.eq("id", user.id)
		.single();

	if (profileError || !profile) {
		return NextResponse.json(
			{ error: "Profile not found", details: profileError?.message },
			{ status: 404 },
		);
	}

	// Verify the face belongs to this user
	const { data: userFace, error: faceError } = await supabase
		.from("faces")
		.select("id, embedding, image_path")
		.eq("id", faceId)
		.eq("profile_id", profile.id)
		.single();

	if (faceError || !userFace) {
		return NextResponse.json(
			{ error: "Face not found or does not belong to you" },
			{ status: 404 },
		);
	}

	// Get today's featured celebrity (opposite gender of user)
	// Since we now have 2 featured celebrities (1 male, 1 female),
	// we filter by opposite gender to get the correct one
	const oppositeGender = profile.gender === "male" ? "female" : "male";
	const { data: celebrity, error: celebError } = await supabase
		.from("celebrities")
		.select("*")
		.eq("is_featured", true)
		.eq("gender", oppositeGender)
		.gte("featured_until", new Date().toISOString())
		.single();

	if (celebError || !celebrity) {
		return NextResponse.json(
			{ error: "No celebrity featured today" },
			{ status: 404 },
		);
	}

	// Check if match already exists in celebrity_matches table
	// (Pre-computed using 6-factor advanced algorithm)
	const { data: existingMatch } = await supabase
		.from("celebrity_matches")
		.select("similarity_score")
		.eq("face_id", userFace.id)
		.eq("celebrity_id", celebrity.id)
		.maybeSingle();

	let similarityScore = existingMatch?.similarity_score;

	// Calculate match on-demand if not exists
	// This handles cases where:
	// 1. User uploads a new photo mid-day and sets it as default
	// 2. Daily cron hasn't run yet for this celebrity rotation
	// OPTIMIZED: Only calculate for the specific featured celebrity (not searching 50!)
	if (!similarityScore) {
		// Get the face details for similarity calculation
		const { data: face, error: faceError } = await supabase
			.from("faces")
			.select(
				"embedding, age, symmetry_score, skin_tone_lab, expression, geometry_ratios",
			)
			.eq("id", userFace.id)
			.single();

		if (faceError || !face || !face.embedding) {
			return NextResponse.json(
				{ error: "Face data not found or incomplete" },
				{ status: 404 },
			);
		}

		// Calculate similarity using the advanced algorithm
		const { data: calculatedScore, error: calcError } = await supabase.rpc(
			"calculate_advanced_similarity",
			{
				query_embedding: face.embedding,
				query_age: face.age,
				query_symmetry: face.symmetry_score,
				query_skin_tone: face.skin_tone_lab,
				query_expression: face.expression,
				query_geometry: face.geometry_ratios,
				target_embedding: celebrity.embedding,
				target_age: celebrity.age,
				target_symmetry: celebrity.symmetry_score,
				target_skin_tone: celebrity.skin_tone_lab,
				target_expression: celebrity.expression,
				target_geometry: celebrity.geometry_ratios,
			},
		);

		if (calcError) {
			console.error("Error calculating similarity:", calcError);
			return NextResponse.json(
				{ error: "Failed to calculate similarity" },
				{ status: 500 },
			);
		}

		similarityScore = calculatedScore || 0.3;

		// Store the match for future queries
		await supabase.from("celebrity_matches").insert({
			face_id: userFace.id,
			celebrity_id: celebrity.id,
			similarity_score: similarityScore,
		});
	}

	// Get public URL for celebrity image (bucket is public)
	const { data: imageUrl } = supabase.storage
		.from("celebrity-images")
		.getPublicUrl(celebrity.image_path);

	return NextResponse.json({
		celebrity: {
			id: celebrity.id,
			name: celebrity.name,
			bio: celebrity.bio,
			category: celebrity.category,
			image_path: celebrity.image_path,
			image_url: imageUrl.publicUrl,
			featured_until: celebrity.featured_until,
		},
		similarity_score: similarityScore,
		is_featured: true,
	});
}
