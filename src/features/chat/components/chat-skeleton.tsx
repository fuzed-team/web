import { MessagesSquare, Search as SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatSkeleton() {
	return (
		<section className="flex h-full sm:h-[calc(100svh-56px)] gap-6 max-w-7xl w-full mx-auto px-4 py-6 md:px-10 md:pb-10 md:pt-0">
			{/* Left Side - Conversation List Skeleton */}
			<div className="flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80">
				{/* Header */}
				<div className="sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
					<div className="flex items-center justify-between py-2">
						<div className="flex gap-2">
							<h2 className="md:text-2xl text-xl font-semibold tracking-tight text-foreground">
								Inbox
							</h2>
						</div>
					</div>

					{/* Search Input Skeleton */}
					<div className="border-border flex h-10 w-full items-center space-x-0 rounded-md border ps-2">
						<SearchIcon
							size={15}
							className="me-2 stroke-slate-500 opacity-50"
						/>
						<div className="h-4 w-24 bg-muted rounded animate-pulse" />
					</div>
				</div>

				{/* List Items */}
				<div className="flex flex-col gap-2 px-1">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className="flex gap-3 w-full py-3">
							<Skeleton className="size-10 rounded-full flex-shrink-0" />
							<div className="flex-1 space-y-2 py-1">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-3 w-32" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Right Side - Empty State */}
			<div className="bg-card hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs sm:flex">
				<div className="flex flex-col items-center space-y-6">
					<div className="border-border flex size-16 items-center justify-center rounded-full border-2">
						<MessagesSquare className="size-8" />
					</div>
					<div className="space-y-2 text-center">
						<h1 className="text-xl font-semibold">Your messages</h1>
						<p className="text-muted-foreground text-sm">
							Select a conversation to start a chat.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
