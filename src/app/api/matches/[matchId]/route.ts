import { NextResponse } from "next/server";
import { withSession } from "@/lib/middleware/with-session";

/**
 * GET /api/matches/[matchId] - Get match details including commonalities
 *
 * Returns:
 * - Match data (face_a, face_b, similarity_score)
 * - Commonalities between the two faces (age, geometry, symmetry, skin_tone, expression)
 */
export const GET = withSession(
	async ({ supabase, session, params }): Promise<NextResponse> => {
		const matchId = params.matchId;

		if (!matchId) {
			return NextResponse.json(
				{ error: "matchId is required" },
				{ status: 400 },
			);
		}

		// Fetch match data
		const { data: match, error: matchError } = await supabase
			.from("matches")
			.select(
				`
        id,
        similarity_score,
        created_at,
        face_a_id,
        face_b_id,
        face_a:faces!matches_face_a_id_fkey (
          id,
          image_path,
          profile_id,
          profile:profiles!faces_profile_id_fkey (
            id,
            name,
            gender,
            school
          )
        ),
        face_b:faces!matches_face_b_id_fkey (
          id,
          image_path,
          profile_id,
          profile:profiles!faces_profile_id_fkey (
            id,
            name,
            gender,
            school
          )
        )
      `,
			)
			.eq("id", matchId)
			.single();

		if (matchError || !match) {
			console.error("Error fetching match:", matchError);
			return NextResponse.json({ error: "Match not found" }, { status: 404 });
		}

		// Get commonalities using database function
		const { data: commonalities, error: commonalitiesError } =
			await supabase.rpc("get_match_commonalities", {
				face_id_1: match.face_a_id,
				face_id_2: match.face_b_id,
			});

		if (commonalitiesError) {
			console.error("Error fetching commonalities:", commonalitiesError);
			// Don't fail the request if commonalities fetch fails
			// Just return empty array
		}

		return NextResponse.json({
			match: {
				id: match.id,
				similarity_score: match.similarity_score,
				created_at: match.created_at,
				face_a_id: match.face_a_id,
				face_b_id: match.face_b_id,
			},
			commonalities: commonalities || [],
		});
	},
);
