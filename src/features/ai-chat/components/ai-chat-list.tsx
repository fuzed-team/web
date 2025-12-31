"use client";

import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCelebMatch } from "@/features/matching/api/get-celeb-match";
import { cn } from "@/lib/utils";

interface AIChatListProps {
	selectedCelebrityId?: string;
	onSelect: (celebrityId: string) => void;
	searchQuery?: string;
	className?: string;
}

export function AIChatList({
	selectedCelebrityId,
	onSelect,
	searchQuery = "",
	className,
}: AIChatListProps) {
	const { data: matches, isLoading } = useCelebMatch({
		input: { limit: 20 },
	});

	const filteredMatches = matches?.filter((match) =>
		match.celeb.name.toLowerCase().includes(searchQuery.toLowerCase())
	) || [];

	if (isLoading) {
		return (
			<div className={cn("flex flex-col gap-2 p-4", className)}>
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-3 p-3 animate-pulse"
					>
						<div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
							<div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (!matches || matches.length === 0) {
		return (
			<div className={cn("flex flex-col items-center justify-center p-6 text-center opacity-50 h-full min-h-[300px]", className)}>
				<MessageCircle className="h-12 w-12 mb-4" />
				<h3 className="font-semibold mb-1">No AI matches yet</h3>
				<p className="text-sm">Matched celebrities will appear here for you to chat with!</p>
			</div>
		);
	}

	return (
		<ScrollArea className={cn("h-full", className)}>
			<div className="flex flex-col gap-1 p-2">
				{filteredMatches.map((match) => (
					<button
						key={match.celeb.id}
						type="button"
						onClick={() => onSelect(match.celeb.id)}
						className={cn(
							"flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-800 text-left",
							selectedCelebrityId === match.celeb.id && "bg-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-200 dark:ring-gray-700"
						)}
					>
						<Avatar className="h-12 w-12 border-2 border-white dark:border-gray-900 shadow-sm">
							<AvatarImage src={match.celeb.image} alt={match.celeb.name} className="object-cover" />
							<AvatarFallback>{match.celeb.name[0]}</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-baseline mb-0.5">
								<h4 className="font-semibold text-sm truncate">{match.celeb.name}</h4>
								<span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
									{match.matchPercentage}%
								</span>
							</div>
							<p className="text-xs text-muted-foreground truncate italic">
								{match.celeb.bio || `Chat with ${match.celeb.name}`}
							</p>
						</div>
					</button>
				))}
				{filteredMatches.length === 0 && searchQuery && (
					<div className="p-8 text-center text-sm text-muted-foreground">
						No celebrities found matching "{searchQuery}"
					</div>
				)}
			</div>
		</ScrollArea>
	);
}
