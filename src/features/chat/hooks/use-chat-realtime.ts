import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useUser } from "@/features/auth/api/get-me";
import { useMarkMessageNotificationsRead } from "@/features/notifications/api/mark-message-notifications-read";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "../types";

interface UseChatRealtimeOptions {
	connectionId: string;
	enabled?: boolean;
	/**
	 * Optional callback when a new message is received
	 */
	onMessage?: (message: Message) => void;
}

/**
 * Hook for subscribing to real-time message updates for a connection
 * Uses Supabase Realtime with broadcast pattern
 * Based on Supabase UI best practices with optimistic updates
 */
export function useChatRealtime({
	connectionId,
	enabled = true,
	onMessage,
}: UseChatRealtimeOptions) {
	const queryClient = useQueryClient();
	const supabase = createClient();
	const currentUser = useUser();
	const markAsReadMutation = useMarkMessageNotificationsRead();

	const handleNewMessage = useCallback(
		(message: Message) => {
			// Optimistically update the messages cache (InfiniteData structure)
			queryClient.setQueryData<{
				pageParams: (string | undefined)[];
				pages: {
					messages: Message[];
					has_more: boolean;
					next_cursor: string | null;
				}[];
			}>(["messages", connectionId], (old) => {
				if (!old || !old.pages.length) {
					// Create initial InfiniteData structure
					return {
						pageParams: [undefined],
						pages: [
							{
								messages: [message],
								has_more: false,
								next_cursor: null,
							},
						],
					};
				}

				const firstPage = old.pages[0];

				// Avoid duplicates (check by ID, ignore temp IDs)
				const exists = firstPage.messages.some(
					(msg) => msg.id === message.id && !msg.id.startsWith("temp-"),
				);

				if (exists) {
					console.log("[Chat Realtime] Message already exists, skipping");
					return old;
				}

				// Remove any pending messages from the same sender with similar content
				const filteredMessages = firstPage.messages.filter(
					(msg) =>
						!(
							msg.pending &&
							msg.sender_id === message.sender_id &&
							msg.content === message.content
						),
				);

				// Add new message to first page (newest messages)
				return {
					...old,
					pages: [
						{
							...firstPage,
							messages: [...filteredMessages, message],
						},
						...old.pages.slice(1),
					],
				};
			});

			// If the message is from someone else (not current user), mark as read automatically
			// since the user is already viewing this conversation
			if (currentUser?.id && message.sender_id !== currentUser.id) {
				markAsReadMutation.mutate({ connection_id: connectionId });
			}

			// Invalidate connections to update last message preview
			queryClient.invalidateQueries({ queryKey: ["connections"] });

			// Call optional callback
			onMessage?.(message);
		},
		[connectionId, queryClient, onMessage, currentUser?.id, markAsReadMutation],
	);

	useEffect(() => {
		if (!enabled || !connectionId) return;

		let channel: RealtimeChannel | null = null;

		// Subscribe to new messages for this connection using broadcast pattern
		// This matches how notifications work and ensures real-time delivery
		const subscribeToMessages = async () => {
			channel = supabase
				.channel(`connection:${connectionId}`)
				.on("broadcast", { event: "message" }, ({ payload }) => {
					// Handle incoming broadcast message
					handleNewMessage(payload as Message);
				})
				.subscribe((status) => {
					if (status === "SUBSCRIBED") {
						console.log(
							`[Chat Realtime] ✅ Subscribed to connection: ${connectionId}`,
						);
					} else if (status === "CHANNEL_ERROR") {
						console.error(
							`[Chat Realtime] ❌ Error subscribing to connection: ${connectionId}`,
						);
					} else if (status === "TIMED_OUT") {
						console.error(
							`[Chat Realtime] ⏱️ Subscription timed out for connection: ${connectionId}`,
						);
					} else {
						console.log(
							`[Chat Realtime] Status: ${status} for connection: ${connectionId}`,
						);
					}
				});
		};

		subscribeToMessages();

		// Cleanup function
		return () => {
			if (channel) {
				console.log(
					`[Chat Realtime] 🔌 Unsubscribing from connection: ${connectionId}`,
				);
				supabase.removeChannel(channel);
			}
		};
	}, [connectionId, enabled, supabase, handleNewMessage]);
}
