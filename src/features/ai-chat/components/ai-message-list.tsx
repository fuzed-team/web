"use client";

import { useChatScroll } from "@/features/chat/hooks/use-chat-scroll";
import { cn } from "@/lib/utils";
import type { AIMessage } from "../types";
import { AIChatMessage } from "./ai-chat-message";
import { AITypingIndicator } from "./ai-typing-indicator";

interface AIMessageListProps {
	messages: AIMessage[];
	isTyping?: boolean;
	className?: string;
}

export function AIMessageList({
	messages,
	isTyping,
	className,
}: AIMessageListProps) {
	// Auto-scroll to bottom when new messages arrive or typing status changes
	const scrollRef = useChatScroll<HTMLDivElement>({
		dependencies: [
			messages.length,
			isTyping,
			messages[messages.length - 1]?.content,
		],
		enabled: true,
		smooth: true,
	});

	return (
		<div
			ref={scrollRef}
			className={cn("flex-1 overflow-y-auto p-4 space-y-2", className)}
		>
			{messages.length === 0 && !isTyping && (
				<div className="flex flex-col items-center justify-center h-full text-center px-4 py-10 opacity-50">
					<div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
						<svg
							className="w-10 h-10 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold mb-2">
						Say hello to your match!
					</h3>
					<p className="text-sm max-w-xs">
						Start a conversation with your AI celebrity partner. They're excited
						to meet you!
					</p>
				</div>
			)}

			{messages.map((message, index) => {
				const prevMessage = index > 0 ? messages[index - 1] : null;
				const showHeader = !prevMessage || prevMessage.role !== message.role;

				return (
					<AIChatMessage
						key={message.id}
						message={message}
						showHeader={showHeader}
					/>
				);
			})}

			{isTyping && (
				<div className="flex justify-start mb-4">
					<AITypingIndicator />
				</div>
			)}
		</div>
	);
}
