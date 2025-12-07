import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConnectionsResponse } from "@/features/chat/types";
import api from "@/lib/api-client";
import type { MessageNotificationsCountResponse } from "./get-message-notifications-count";

interface MarkMessageNotificationsReadResponse {
	marked_count: number;
}

interface MarkMessageNotificationsReadParams {
	connection_id: string;
}

/**
 * Mark all message notifications for a connection as read
 */
export async function markMessageNotificationsRead(
	params: MarkMessageNotificationsReadParams,
): Promise<MarkMessageNotificationsReadResponse> {
	return api.post<MarkMessageNotificationsReadResponse>(
		"/notifications/messages/read-by-connection",
		params,
	);
}

/**
 * React Query mutation hook for marking message notifications as read
 * with optimistic updates for both sidebar badge and connections list
 */
export function useMarkMessageNotificationsRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: markMessageNotificationsRead,

		// Optimistically update the cache before the mutation
		onMutate: async ({ connection_id }) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({
				queryKey: ["messages", "count"],
			});
			await queryClient.cancelQueries({
				queryKey: ["connections"],
			});

			// Snapshot previous values for rollback
			const previousMessageCount =
				queryClient.getQueryData<MessageNotificationsCountResponse>([
					"messages",
					"count",
				]);

			const previousConnections =
				queryClient.getQueriesData<ConnectionsResponse>({
					queryKey: ["connections"],
				});

			// Find current unread count for this connection to calculate decrease
			let unreadCountToDecrease = 0;
			queryClient.setQueriesData<ConnectionsResponse>(
				{ queryKey: ["connections"] },
				(old) => {
					if (!old) return old;

					return {
						...old,
						connections: old.connections.map((conn) => {
							if (conn.id === connection_id) {
								unreadCountToDecrease = conn.unread_count;
								return { ...conn, unread_count: 0 };
							}
							return conn;
						}),
					};
				},
			);

			// Optimistically update message notification count
			queryClient.setQueryData<MessageNotificationsCountResponse>(
				["messages", "count"],
				(old) => {
					if (!old) return old;
					return {
						unread_count: Math.max(0, old.unread_count - unreadCountToDecrease),
					};
				},
			);

			return {
				previousMessageCount,
				previousConnections,
				unreadCountToDecrease,
			};
		},

		// On error, rollback to previous values
		onError: (_error, _params, context) => {
			if (context?.previousMessageCount) {
				queryClient.setQueryData(
					["messages", "count"],
					context.previousMessageCount,
				);
			}
			if (context?.previousConnections) {
				context.previousConnections.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},

		// Always refetch after error or success
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: ["messages", "count"],
			});
			queryClient.invalidateQueries({
				queryKey: ["connections"],
			});
		},
	});
}
