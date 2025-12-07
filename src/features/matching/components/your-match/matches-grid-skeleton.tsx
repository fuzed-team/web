import { Skeleton } from "@/components/ui/skeleton";

export const MatchesGridSkeleton = () => {
	return (
		<div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col h-full">
			{/* Carousel Image Skeleton */}
			<div className="relative mb-3">
				<div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
					<Skeleton className="w-full h-full" />
					{/* Match Percentage Badge */}
					<div className="absolute top-2 right-2">
						<Skeleton className="h-6 w-12 rounded-md" />
					</div>
					{/* Carousel Dots */}
					<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
						{Array.from({ length: 3 }).map((_, idx) => (
							<Skeleton key={idx} className="h-1.5 w-1.5 rounded-full" />
						))}
					</div>
				</div>
			</div>

			{/* Name and Info Skeleton */}
			<div className="mb-4">
				<Skeleton className="h-6 w-3/4 mb-2" />
				<div className="flex items-center justify-between gap-2">
					<Skeleton className="h-3 w-20" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>

			{/* Generate Baby Button Skeleton */}
			<div className="mt-auto">
				<Skeleton className="h-9 w-full rounded-lg" />
			</div>
		</div>
	);
};
