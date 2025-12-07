"use client";

import { Suspense } from "react";
import { ChatContainer } from "@/features/chat/components/chat-container";
import { ChatSkeleton } from "@/features/chat/components/chat-skeleton";

export default function ChatPage() {
	return (
		<Suspense fallback={<ChatSkeleton />}>
			<ChatContainer />
		</Suspense>
	);
}
