import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/middleware/error-handler";
import { withSession } from "@/lib/middleware/with-session";

/**
 * GET /api/notifications/messages/count
 * Get unread message notification count
 */
export const GET = withSession(async ({ supabase, session }) => {
	try {
		// Get unread count for new_message type only
		const { count: unreadCount } = await supabase
			.from("notifications")
			.select("*", { count: "exact", head: true })
			.eq("user_id", session.user.id)
			.eq("type", "new_message")
			.is("read_at", null);

		return NextResponse.json({
			unread_count: unreadCount || 0,
		});
	} catch (error) {
		return handleApiError(error);
	}
});
