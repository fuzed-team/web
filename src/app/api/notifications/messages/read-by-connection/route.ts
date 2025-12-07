import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/middleware/error-handler";
import { withSession } from "@/lib/middleware/with-session";

/**
 * POST /api/notifications/messages/read-by-connection
 * Mark all new_message notifications AND messages for a connection as read
 *
 * Body: { connection_id: string }
 */
export const POST = withSession(async ({ request, supabase, session }) => {
	try {
		const body = await request.json();
		const { connection_id } = body;

		if (!connection_id) {
			return NextResponse.json(
				{ error: "connection_id is required" },
				{ status: 400 },
			);
		}

		// 1. Mark all unread messages from OTHER user as read
		const { data: markedMessages, error: messagesError } = await supabase
			.from("messages")
			.update({ read_at: new Date().toISOString() })
			.eq("connection_id", connection_id)
			.neq("sender_id", session.user.id) // Messages not sent by current user
			.is("read_at", null)
			.select("id");

		if (messagesError) {
			throw messagesError;
		}

		const markedMessageIds = markedMessages?.map((m) => m.id) || [];

		// 2. Mark all new_message notifications with related_id in markedMessageIds as read
		let markedNotificationsCount = 0;
		if (markedMessageIds.length > 0) {
			const { data: updatedNotifications, error: notificationsError } =
				await supabase
					.from("notifications")
					.update({ read_at: new Date().toISOString() })
					.eq("user_id", session.user.id)
					.eq("type", "new_message")
					.in("related_id", markedMessageIds)
					.is("read_at", null)
					.select("id");

			if (notificationsError) {
				throw notificationsError;
			}

			markedNotificationsCount = updatedNotifications?.length || 0;
		}

		return NextResponse.json({
			marked_messages_count: markedMessageIds.length,
			marked_notifications_count: markedNotificationsCount,
		});
	} catch (error) {
		return handleApiError(error);
	}
});
