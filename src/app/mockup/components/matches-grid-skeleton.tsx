import { Skeleton } from "@/components/ui/skeleton";

export const MatchesGridSkeleton = () => {
	return (
		<div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col h-full">
			{/* Main Match Image Skeleton */}
			<div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-3 bg-muted">
				<Skeleton className="w-full h-full" />
				<div className="absolute top-2 right-2">
					<Skeleton className="h-6 w-12 rounded-md" />
				</div>
			</div>

			<div className="flex justify-between items-start mb-2">
				<div className="w-full">
					<Skeleton className="h-5 w-3/4 mb-1" />
				</div>
			</div>

			{/* Alternate Matches Row Skeleton */}
			<div className="mt-auto pt-3 border-t border-border">
				<Skeleton className="h-3 w-1/2 mb-2" />
				<div className="flex items-center gap-2">
					{Array.from({ length: 3 }).map((_, j) => (
						<Skeleton key={j} className="w-10 h-10 rounded-lg" />
					))}
				</div>
			</div>
		</div>
	);
};
