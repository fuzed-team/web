export function BabyHistorySkeleton() {
	return (
		<div className="space-y-6">
			{/* Header Skeleton */}
			<div className="flex items-center justify-between animate-pulse">
				<div className="flex items-center gap-2">
					<div className="h-5 w-36 bg-muted rounded" />
					<div className="h-5 w-16 bg-muted/50 rounded-full" />
				</div>
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-muted rounded" />
					<div className="w-8 h-8 bg-muted rounded" />
				</div>
			</div>

			{/* Grid Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, index) => (
					<div
						key={index}
						className="flex flex-col border rounded-2xl overflow-hidden bg-card border-border animate-pulse"
					>
						{/* Image Skeleton */}
						<div className="aspect-square bg-muted" />

						{/* Details Skeleton */}
						<div className="p-4 space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center -space-x-2">
									<div className="w-8 h-8 rounded-full bg-muted border-2 border-card" />
									<div className="w-8 h-8 rounded-full bg-muted border-2 border-card" />
									<div className="w-6 h-6 rounded-full bg-muted border-2 border-card ml-1" />
								</div>
								<div className="space-y-1">
									<div className="h-3 w-16 bg-muted rounded" />
									<div className="h-3 w-12 bg-muted rounded" />
								</div>
							</div>
							<div className="flex gap-2">
								<div className="h-6 w-12 bg-muted/50 rounded" />
								<div className="h-6 w-20 bg-muted/50 rounded" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
