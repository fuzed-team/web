"use client";

import { MessageCircle, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkMessageNotificationsRead } from "@/features/notifications/api/mark-message-notifications-read";
import { cn } from "@/lib/utils";
import type { MutualConnection } from "../types";
import { ConnectionItem } from "./connection-item";
import { AIChatList } from "@/features/ai-chat/components/ai-chat-list";

export interface ChatListProps {
	connections: MutualConnection[];
	selectedConnectionId?: string;
	activeTab?: "inbox" | "ai";
	onTabChange?: (tab: "inbox" | "ai") => void;
	selectedCelebrityId?: string;
	onCelebritySelect?: (celebrityId: string) => void;
	className?: string;
	onConnectionSelect?: (connection: MutualConnection) => void;
}

export function ChatList({
	connections,
	onConnectionSelect,
	selectedConnectionId,
	activeTab = "inbox",
	onTabChange,
	selectedCelebrityId,
	onCelebritySelect,
	className,
}: ChatListProps) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const markAsReadMutation = useMarkMessageNotificationsRead();

	// Filter connections by search query
	const filteredConnections = connections.filter((conn) =>
		conn.other_user.name
			.toLowerCase()
			.includes(searchQuery.trim().toLowerCase()),
	);

	const handleConnectionClick = (connection: MutualConnection) => {
		// Mark notifications as read if there are unread messages
		if (connection.unread_count > 0) {
			markAsReadMutation.mutate({ connection_id: connection.id });
		}

		if (onConnectionSelect) {
			onConnectionSelect(connection);
		} else {
			router.push(`/chat/${connection.id}`);
		}
	};

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80",
				className,
			)}
		>
			{/* Sticky header with tabs and search */}
			<div className="sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none bg-background">
				<div className="py-2">
					<Tabs
						value={activeTab}
						onValueChange={(v) => onTabChange?.(v as "inbox" | "ai")}
						className="w-full"
					>
						<TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4 rounded-none border-b border-border mb-2">
							<TabsTrigger
								value="inbox"
								className="text-xl font-semibold px-0 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
							>
								Inbox
							</TabsTrigger>
							<TabsTrigger
								value="ai"
								className="text-xl font-semibold px-0 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none"
							>
								AI Chats
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

				{/* Search input */}
				<label
					className={cn(
						"focus-within:ring-ring focus-within:ring-1 focus-within:outline-hidden",
						"border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2 bg-muted/50"
					)}
				>
					<SearchIcon size={15} className="me-2 stroke-slate-500" />
					<span className="sr-only">Search</span>
					<input
						type="text"
						className="w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden"
						placeholder={activeTab === 'inbox' ? "Search chat..." : "Search celebrities..."}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</label>
			</div>

			{/* List Content */}
			{activeTab === "inbox" ? (
				connections.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-50">
						<MessageCircle className="h-12 w-12 mb-4" />
						<h3 className="font-semibold mb-1">No conversations yet</h3>
						<p className="text-sm">Generate babies with your matches to unlock chat!</p>
					</div>
				) : (
					<ScrollArea className="-mx-3 h-full p-3">
						<div className="flex flex-col gap-1">
							{filteredConnections.map((connection) => (
								<ConnectionItem
									key={connection.id}
									connection={connection}
									isSelected={selectedConnectionId === connection.id}
									onClick={() => handleConnectionClick(connection)}
								/>
							))}
						</div>
					</ScrollArea>
				)
			) : (
				<AIChatList
					className="-mx-3"
					searchQuery={searchQuery}
					selectedCelebrityId={selectedCelebrityId}
					onSelect={(id) => onCelebritySelect?.(id)}
				/>
			)}
		</div>
	);
}
