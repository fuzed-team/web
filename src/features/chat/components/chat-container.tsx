"use client";

import { MessagesSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLayout } from "@/features/admin/context/layout-provider";
import { cn } from "@/lib/utils";
import { useConnections } from "../api/get-connections";
import type { MutualConnection } from "../types";
import { ChatList } from "./chat-list";
import { ChatRoom } from "./chat-room";
import { AIChatContainer } from "@/features/ai-chat/components/ai-chat-container";
import { useCelebrity } from "@/features/ai-chat/api/get-celebrity";

interface ChatContainerProps {
	/**
	 * Optional default connection ID to select (e.g., from URL)
	 */
	defaultConnectionId?: string;
}

export function ChatContainer({ defaultConnectionId }: ChatContainerProps) {
	const searchParams = useSearchParams();
	const initialTab = searchParams.get("tab") === "ai" ? "ai" : "inbox";
	const initialCelebId = searchParams.get("celebId");

	const [activeTab, setActiveTab] = useState<"inbox" | "ai">(initialTab);
	const [selectedConnection, setSelectedConnection] =
		useState<MutualConnection | null>(null);
	const [selectedCelebrityId, setSelectedCelebrityId] = useState<string | null>(initialCelebId);
	const [mobileSelectedConnection, setMobileSelectedConnection] =
		useState<MutualConnection | null>(null);
	const { setHeaderVisible } = useLayout();

	const { data: celebData } = useCelebrity({ id: selectedCelebrityId || "" });
	const celebrity = celebData;

	const { data } = useConnections();
	const connections = data?.connections || [];

	useEffect(() => {
		if (mobileSelectedConnection) {
			setHeaderVisible(false);
		} else {
			setHeaderVisible(true);
		}
		// Reset when unmounting or changing state excessively
		return () => setHeaderVisible(true);
	}, [mobileSelectedConnection, setHeaderVisible]);

	// Set the default connection when data is loaded
	useEffect(() => {
		if (defaultConnectionId && !selectedConnection && connections.length > 0) {
			const defaultConnection = connections.find(
				(conn) => conn.id === defaultConnectionId,
			);
			if (defaultConnection) {
				setSelectedConnection(defaultConnection);
				setMobileSelectedConnection(defaultConnection);
			}
		}
	}, [connections, defaultConnectionId, selectedConnection]);

	const handleConnectionSelect = (connection: MutualConnection) => {
		setSelectedConnection(connection);
		setMobileSelectedConnection(connection);
	};

	return (
		<section className="flex h-full sm:h-[calc(100svh-56px)] gap-6 max-w-7xl w-full mx-auto px-4 py-6 md:px-10 md:pb-10 md:pt-0">
			{/* Left Side - Conversation List */}
			<ChatList
				connections={connections}
				selectedConnectionId={selectedConnection?.id}
				onConnectionSelect={handleConnectionSelect}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				selectedCelebrityId={selectedCelebrityId || undefined}
				onCelebritySelect={setSelectedCelebrityId}
			/>

			{/* Right Side - Chat Room, AI Chat Container or Empty State */}
			{(activeTab === "inbox" && selectedConnection) || (activeTab === "ai" && celebrity) ? (
				<div
					className={cn(
						"bg-white absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border shadow-xs overflow-hidden sm:static sm:z-auto sm:flex sm:rounded-md",
						(activeTab === "inbox" ? mobileSelectedConnection : celebrity) && "start-0 flex",
					)}
				>
					{activeTab === "inbox" && selectedConnection ? (
						<ChatRoom
							connectionId={selectedConnection.id}
							connection={{
								id: selectedConnection.id,
								other_user: selectedConnection.other_user,
								baby_image: selectedConnection.baby_image,
							}}
							onBack={() => setMobileSelectedConnection(null)}
							className="h-full"
						/>
					) : activeTab === "ai" && celebrity ? (
						<AIChatContainer
							celebrity={celebrity}
							onBack={() => setSelectedCelebrityId(null)}
						/>
					) : null}
				</div>
			) : (
				<div
					className={cn(
						"bg-card absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:static sm:z-auto sm:flex",
					)}
				>
					<div className="flex flex-col items-center space-y-6">
						<div className="border-border flex size-16 items-center justify-center rounded-full border-2">
							<MessagesSquare className="size-8" />
						</div>
						<div className="space-y-2 text-center">
							<h1 className="text-xl font-semibold">
								{activeTab === "inbox" ? "Your messages" : "AI Celebrity Chats"}
							</h1>
							<p className="text-muted-foreground text-sm">
								{activeTab === "inbox" 
									? "Select a conversation to start a chat." 
									: "Select a celebrity match to start an AI conversation."}
							</p>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
