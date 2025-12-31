import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/features/auth/api/get-me";
import api from "@/lib/api-client";
import type { Message, MessagesResponse, SendMessageParams } from "../types";

// InfiniteData structure type
type MessagesInfiniteData = {
	pageParams: (string | undefined)[];
	pages: MessagesResponse[];
};

export async function sendMessage(params: SendMessageParams): Promise<Message> {
	return api.post<Message>("/messages", params);
}

export function useSendMessage() {
	const queryClient = useQueryClient();
	const currentUser = useUser();

	return useMutation({
		mutationFn: sendMessage,
		onMutate: async (variables) => {
			await queryClient.cancelQueries({
				queryKey: ["messages", variables.connection_id],
			});

			const previousMessages = queryClient.getQueryData<MessagesInfiniteData>([
				"messages",
				variables.connection_id,
			]);

			if (previousMessages?.pages?.length && currentUser) {
				const firstPage = previousMessages.pages[0];

				// Ensure optimistic message timestamp is always greater than any existing message
				// This prevents sorting issues when messages from other users arrive via realtime
				const allMessages = previousMessages.pages.flatMap((p) => p.messages);
				const existingTimestamps = allMessages.map((msg) =>
					new Date(msg.created_at).getTime(),
				);
				const maxExistingTimestamp = Math.max(0, ...existingTimestamps);
				const optimisticTimestamp = Math.max(
					maxExistingTimestamp + 1,
					Date.now(),
				);

				const optimisticMessage: Message = {
					id: `temp-${Date.now()}`, // Temporary ID
					local_id: `temp-${Date.now()}`,
					sender_id: currentUser.id,
					sender_name: currentUser.name || "You",
					content: variables.content,
					message_type: variables.message_type || "text",
					read_at: null,
					created_at: new Date(optimisticTimestamp).toISOString(),
					pending: true, // Mark as pending for reduced opacity
				};

				// Add optimistic message to first page
				const updatedCache: MessagesInfiniteData = {
					...previousMessages,
					pages: [
						{
							...firstPage,
							messages: [...firstPage.messages, optimisticMessage],
						},
						...previousMessages.pages.slice(1),
					],
				};

				queryClient.setQueryData<MessagesInfiniteData>(
					["messages", variables.connection_id],
					updatedCache,
				);
			} else {
				console.warn("[Send Message] Cannot add optimistic message:", {
					previousMessages,
					currentUser,
				});
			}

			return { previousMessages };
		},
		// On success, replace pending message with real one
		onSuccess: (data, variables) => {
			const cachedData = queryClient.getQueryData<MessagesInfiniteData>([
				"messages",
				variables.connection_id,
			]);

			if (cachedData?.pages?.length) {
				// Update all pages to remove pending and add real message
				const updatedPages = cachedData.pages.map((page, index) => {
					if (index === 0) {
						// First page: remove pending messages and add real message
						const updatedMessages = page.messages
							.filter((msg) => !msg.pending) // Remove all pending messages
							.concat({
								...data,
								pending: false,
							});

						// Remove duplicates by ID
						const uniqueMessages = Array.from(
							new Map(updatedMessages.map((msg) => [msg.id, msg])).values(),
						);

						return {
							...page,
							messages: uniqueMessages,
						};
					}
					return page;
				});

				const finalCache: MessagesInfiniteData = {
					...cachedData,
					pages: updatedPages,
				};

				queryClient.setQueryData<MessagesInfiniteData>(
					["messages", variables.connection_id],
					finalCache,
				);
			}

			// Invalidate connections to update last message preview
			// queryClient.invalidateQueries({ queryKey: ["connections"] });
		},
		// On error, rollback to previous state
		onError: (error, variables, context) => {
			console.error("[Send Message] Failed to send message:", error);

			if (context?.previousMessages) {
				queryClient.setQueryData(
					["messages", variables.connection_id],
					context.previousMessages,
				);
			}
		},
	});
}
