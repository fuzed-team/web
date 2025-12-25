import { Skeleton } from "@/components/ui/skeleton";
import { GenerationCardSkeleton } from "./generation-card-skeleton";

interface BabyHistorySkeletonProps {
	activeTab?: "personal" | "celebrity";
}

export function BabyHistorySkeleton({
	activeTab = "personal",
}: BabyHistorySkeletonProps) {
	return (
		<>
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h2 className="md:text-2xl text-xl font-semibold tracking-tight text-foreground">
						Recent Generations
					</h2>
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
			</div>

			{/* Tabs Section */}
			<div className="flex items-center border-b border-border mb-6">
				<nav className="flex space-x-8" aria-label="Tabs">
					<button
						type="button"
						disabled
						className={`py-4 px-1 text-base font-medium border-b-2 transition-colors ${
							activeTab === "personal"
								? "border-foreground text-foreground"
								: "border-transparent text-muted-foreground"
						}`}
					>
						Personal
					</button>
					<button
						type="button"
						disabled
						className={`group flex items-center py-4 px-1 text-base font-medium border-b-2 transition-colors ${
							activeTab === "celebrity"
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground"
						}`}
					>
						Celebrity Match
					</button>
				</nav>
			</div>

			{/* Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
				{Array.from({ length: 8 }).map((_, index) => (
					<GenerationCardSkeleton key={index} />
				))}
			</div>
		</>
	);
}
