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

	// Get today's featured celebrity
	const { data: celebrity, error: celebError } = await supabase
		.from("celebrities")
		.select("*")
		.eq("is_featured", true)
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
	// Uses advanced matching algorithm (embedding 20%, geometry 20%, age 15%,
	// symmetry 15%, skin_tone 15%, expression 15%)
	if (!similarityScore) {
		const { data: rpcMatches, error: rpcError } = await supabase.rpc(
			"find_celebrity_matches_advanced",
			{
				query_face_id: userFace.id,
				user_gender: profile.gender,
				match_threshold: 0.0, // Get any score, even low matches
				match_count: 50, // Get top 50 to ensure we find featured celebrity
			},
		);

		if (rpcError) {
			console.error("Error calling find_celebrity_matches_advanced:", rpcError);
			// Fallback to default score
			similarityScore = 0.5;
		} else {
			// Find the featured celebrity in results
			const celebrityMatch = rpcMatches?.find(
				(m: any) => m.id === celebrity.id,
			);
			similarityScore = celebrityMatch?.similarity || 0.5;

			// Store the match for future queries
			if (celebrityMatch && celebrityMatch.similarity) {
				await supabase.from("celebrity_matches").insert({
					face_id: userFace.id,
					celebrity_id: celebrity.id,
					similarity_score: celebrityMatch.similarity,
				});
			}
		}
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
