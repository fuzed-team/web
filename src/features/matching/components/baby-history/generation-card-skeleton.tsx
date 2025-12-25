import { Skeleton } from "@/components/ui/skeleton";

export function GenerationCardSkeleton() {
	return (
		<div className="flex flex-col border rounded-2xl overflow-hidden bg-card border-border">
			{/* Image Container Skeleton */}
			<div className="relative aspect-square bg-muted">
				<Skeleton className="w-full h-full" />
				{/* Time Badge */}
				<div className="absolute top-3 right-3">
					<Skeleton className="h-5 w-14 rounded-md" />
				</div>
			</div>

			{/* Details Skeleton */}
			<div className="p-4 bg-linear-to-b from-card to-muted/50">
				<div className="flex items-center justify-between">
					{/* Avatar Group */}
					<div className="flex items-center -space-x-2">
						<Skeleton className="w-8 h-8 rounded-full border-2 border-card" />
						<Skeleton className="w-8 h-8 rounded-full border-2 border-card" />
					</div>
					{/* With Text */}
					<div className="text-right">
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
			</div>
		</div>
	);
}
