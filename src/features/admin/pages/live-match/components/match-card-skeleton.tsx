import { Skeleton } from "@/components/ui/skeleton";

export const MatchCardSkeleton = () => (
	<div className="relative bg-card rounded-2xl border border-border p-5 shadow-sm">
		<div className="flex items-center justify-between mt-2 mb-6 px-2">
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="w-16 h-16 rounded-full" />
				<Skeleton className="h-4 w-12" />
			</div>
			<div className="flex-1 flex flex-col items-center px-4">
				<Skeleton className="h-8 w-12 mb-2" />
				<Skeleton className="h-0.5 w-full" />
				<Skeleton className="w-6 h-6 rounded-full mt-2" />
			</div>
			<div className="flex flex-col items-center gap-2">
				<Skeleton className="w-16 h-16 rounded-full" />
				<Skeleton className="h-4 w-12" />
			</div>
		</div>
		<div className="pt-3 border-t border-border flex items-center justify-between">
			<Skeleton className="h-4 w-24" />
			<Skeleton className="h-4 w-20" />
		</div>
	</div>
);
