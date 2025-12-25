import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { withSession } from "@/lib/middleware/with-session";
import {
	batchSignUrls,
	getSignedUrl,
} from "@/lib/utils/deduplicate-signed-urls";

/**
 * GET /api/baby/celebrity/list - List user's celebrity baby images
 *
 * Query params:
 *   - user_id: Filter by user (optional, defaults to current user)
 *   - limit: Number of results (default: 20)
 *   - skip: Pagination offset (default: 0)
 */
export const GET = withSession(async ({ session, searchParams, supabase }) => {
	const userId = searchParams.user_id || session.user.id;
	const limit = parseInt(searchParams.limit || "20", 10);
	const skip = parseInt(searchParams.skip || "0", 10);

	// Get babies generated with celebrities (celebrity_match_id is not null)
	const { data: babies, error: babiesError } = await supabase
		.from("babies")
		.select(`
			id,
			celebrity_match_id,
			image_url,
			created_at,
			generated_by_profile_id,
			celebrity_match:celebrity_matches!babies_celebrity_match_id_fkey (
				id,
				similarity_score,
				face:faces!celebrity_matches_face_id_fkey (
					id,
					image_path,
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
					category
				)
			)
		`)
		.eq("generated_by_profile_id", userId)
		.not("celebrity_match_id", "is", null)
		.order("created_at", { ascending: false });

	if (babiesError) {
		throw babiesError;
	}

	// Group babies by celebrity_match_id
	const babyGroups = new Map<string, any[]>();
	(babies || []).forEach((baby: any) => {
		if (!baby.celebrity_match_id) return;

		if (!babyGroups.has(baby.celebrity_match_id)) {
			babyGroups.set(baby.celebrity_match_id, []);
		}
		babyGroups.get(baby.celebrity_match_id)!.push(baby);
	});

	// OPTIMIZATION: Collect all unique image paths first
	const userImagePaths: string[] = [];
	const celebrityImagePaths: string[] = [];

	for (const [, babyImages] of babyGroups.entries()) {
		const firstBaby = babyImages[0];
		const celebMatch = firstBaby.celebrity_match;

		const userImagePath = celebMatch?.face?.image_path;
		const celebrityImagePath = celebMatch?.celebrity?.image_path;

		if (userImagePath) userImagePaths.push(userImagePath);
		if (celebrityImagePath) celebrityImagePaths.push(celebrityImagePath);
	}

	// Batch sign all unique URLs at once
	const userSignedUrlMap = await batchSignUrls(
		supabase,
		STORAGE_BUCKETS.USER_IMAGES,
		userImagePaths,
		env.SUPABASE_SIGNED_URL_TTL,
	);

	// Get public URLs for celebrity images
	const celebrityUrlMap = new Map<string, string>();
	for (const path of celebrityImagePaths) {
		const { data } = supabase.storage
			.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
			.getPublicUrl(path);
		celebrityUrlMap.set(path, data.publicUrl);
	}

	// Format response
	const formattedBabies = Array.from(babyGroups.entries()).map(
		([celebrityMatchId, babyImages]) => {
			const firstBaby = babyImages[0];
			const celebMatch = firstBaby.celebrity_match;

			const profile = celebMatch?.face?.profile;
			const celebrity = celebMatch?.celebrity;
			const userImagePath = celebMatch?.face?.image_path;
			const celebrityImagePath = celebrity?.image_path;

			// Get URLs
			const userImage = getSignedUrl(userSignedUrlMap, userImagePath) || "";
			const celebrityImage = celebrityImagePath
				? celebrityUrlMap.get(celebrityImagePath) || ""
				: "";

			return {
				id: celebrityMatchId,
				me: {
					id: profile?.id || "",
					name: profile?.name || "",
					image: userImage,
				},
				celebrity: {
					id: celebrity?.id || "",
					name: celebrity?.name || "",
					image: celebrityImage,
					category: celebrity?.category || undefined,
				},
				created_at: firstBaby.created_at,
				images: babyImages.map((b: any) => ({
					id: b.id,
					image_url: b.image_url,
				})),
			};
		},
	);

	// Apply pagination to grouped results
	const paginatedBabies = formattedBabies.slice(skip, skip + limit);

	return NextResponse.json({
		babies: paginatedBabies,
		total: formattedBabies.length,
		skip,
		limit,
	});
});
