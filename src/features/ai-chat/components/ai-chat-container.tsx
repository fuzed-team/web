"use client";

import { useState } from "react";
import type { AICelebrity, AIMessage } from "../types";
import { AIChatHeader } from "./ai-chat-header";
import { AIMessageInput } from "./ai-message-input";
import { AIMessageList } from "./ai-message-list";

interface AIChatContainerProps {
	celebrity: AICelebrity;
	initialMessages?: AIMessage[];
	onBack?: () => void;
}

export function AIChatContainer({
	celebrity,
	initialMessages = [],
	onBack,
}: AIChatContainerProps) {
	const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
	const [isTyping, setIsTyping] = useState(false);

	const handleSend = async (content: string) => {
		// Add user message
		const userMessage: AIMessage = {
			id: Date.now().toString(),
			role: "user",
			content,
			created_at: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setIsTyping(true);

		// Simulate AI response for Phase 1 MVP
		setTimeout(() => {
			simulateAIResponse(
				`Hey! This is ${celebrity.name}. I'm so glad you reached out! It's amazing to connect with a fan who shares so much in common. What's on your mind today?`,
			);
		}, 1500);
	};

	const simulateAIResponse = (fullContent: string) => {
		setIsTyping(false);

		const aiMessageId = (Date.now() + 1).toString();
		const newAiMessage: AIMessage = {
			id: aiMessageId,
			role: "assistant",
			content: "",
			created_at: new Date().toISOString(),
			is_streaming: true,
		};

		setMessages((prev) => [...prev, newAiMessage]);

		let currentContent = "";
		const words = fullContent.split(" ");
		let wordIndex = 0;

		const interval = setInterval(() => {
			if (wordIndex < words.length) {
				currentContent += (wordIndex === 0 ? "" : " ") + words[wordIndex];
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === aiMessageId ? { ...msg, content: currentContent } : msg,
					),
				);
				wordIndex++;
			} else {
				clearInterval(interval);
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === aiMessageId ? { ...msg, is_streaming: false } : msg,
					),
				);
			}
		}, 100);
	};

	return (
		<div className="flex flex-col h-full bg-white dark:bg-gray-950 max-w-5xl mx-auto shadow-2xl md:rounded-3xl overflow-hidden border">
			<AIChatHeader celebrity={celebrity} onBack={onBack} />

			<AIMessageList messages={messages} isTyping={isTyping} />

			<AIMessageInput onSend={handleSend} disabled={isTyping} />
		</div>
	);
}
