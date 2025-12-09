import { NextResponse } from "next/server";
import { withSession } from "@/lib/middleware/with-session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getQuotaStatus } from "@/lib/utils/rate-limiting";

/**
 * GET /api/quota - Get current user's daily quota status
 *
 * Returns the current count and limit for:
 * - baby_generations: Number of babies generated today
 * - photo_uploads: Number of photos uploaded today
 */
export const GET = withSession(async ({ session }) => {
	const quotaStatus = await getQuotaStatus(supabaseAdmin, session.user.id);

	return NextResponse.json({
		baby_generations: {
			current: quotaStatus.babyGenerations.current,
			limit: quotaStatus.babyGenerations.limit,
			allowed: quotaStatus.babyGenerations.allowed,
			reset_at: quotaStatus.babyGenerations.resetAt,
		},
		photo_uploads: {
			current: quotaStatus.photoUploads.current,
			limit: quotaStatus.photoUploads.limit,
			allowed: quotaStatus.photoUploads.allowed,
			reset_at: quotaStatus.photoUploads.resetAt,
		},
	});
});
