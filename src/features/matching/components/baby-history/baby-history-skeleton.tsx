import { Skeleton } from "@/components/ui/skeleton";

export function BabyHistorySkeleton() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between animate-pulse">
				<div className="flex items-center gap-2">
					<Skeleton className="h-7 w-40" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
			</div>

			{/* Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, index) => (
					<div
						key={index}
						className="flex flex-col border rounded-2xl overflow-hidden bg-card border-border"
					>
						{/* Image Container Skeleton */}
						<div className="relative aspect-square bg-muted">
							<Skeleton className="w-full h-full" />
							{/* Time Badge */}
							<div className="absolute top-3 right-3">
								<Skeleton className="h-5 w-14 rounded-md" />
							</div>
						</div>

						{/* Details Skeleton */}
						<div className="p-4 bg-gradient-to-b from-card to-muted/50">
							<div className="flex items-center justify-between mb-3">
								{/* Avatar Group */}
								<div className="flex items-center -space-x-2">
									<Skeleton className="w-8 h-8 rounded-full border-2 border-card" />
									<Skeleton className="w-8 h-8 rounded-full border-2 border-card" />
								</div>
								{/* With Text */}
								<div className="text-right space-y-1">
									<Skeleton className="h-3 w-20" />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
