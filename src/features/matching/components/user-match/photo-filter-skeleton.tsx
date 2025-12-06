import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PhotoFilterSkeletonProps {
	className?: string;
}

export const PhotoFilterSkeleton = ({
	className,
}: PhotoFilterSkeletonProps) => {
	return (
		<div className={cn("mb-6", className)}>
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-80" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-8 w-[130px]" />
				</div>
			</div>

			<div className="relative group mb-6">
				<div className="flex overflow-x-auto gap-3 py-4 snap-x-mandatory hide-scrollbar">
					{/* Add Photo Button Skeleton */}
					<div className="flex-shrink-0 snap-center">
						<Skeleton className="w-20 h-24 md:w-24 md:h-32 rounded-xl" />
					</div>

					{/* Photo Card Skeletons */}
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex-shrink-0 snap-center">
							<Skeleton className="w-20 h-24 md:w-24 md:h-32 rounded-xl" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
