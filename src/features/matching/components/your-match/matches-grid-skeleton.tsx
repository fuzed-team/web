import { Skeleton } from "@/components/ui/skeleton";

export const MatchesGridSkeleton = () => {
	return (
		<div className="relative aspect-[4/5] rounded-2xl overflow-hidden dark:bg-[#1A1D24] bg-slate-100 border dark:border-white/5 border-slate-200 shadow-sm">
			{/* Main Image Skeleton */}
			<Skeleton className="w-full h-full rounded-none" />

			{/* Overlay Gradient (simulating the one in MatchCard) */}
			<div className="absolute inset-0 bg-linear-to-t from-black/60 dark:from-black/80 via-transparent to-transparent pointer-events-none" />

			{/* Info Overlay Skeleton */}
			<div className="absolute bottom-4 left-4 right-4 z-10">
				{/* Name Skeleton */}
				<Skeleton className="h-6 w-2/3 mb-2 bg-white/20" />
				<div className="flex items-center justify-between gap-2 mt-0.5">
					{/* Timestamp Skeleton */}
					<Skeleton className="h-3 w-20 bg-white/10" />
					{/* Photos count Skeleton */}
					<Skeleton className="h-4 w-14 rounded-full bg-white/10" />
				</div>
			</div>

			{/* Carousel Dots Skeleton */}
			<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
				{Array.from({ length: 3 }).map((_, idx) => (
					<Skeleton
						key={idx}
						className={`h-1 w-4 rounded-full ${
							idx === 0 ? "bg-white/40" : "bg-white/10"
						}`}
					/>
				))}
			</div>
		</div>
	);
};
