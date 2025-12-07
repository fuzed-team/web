import { Skeleton } from "@/components/ui/skeleton";

export const StatCardSkeleton = () => (
	<div className="p-4 rounded-xl bg-card border border-border shadow-sm">
		<Skeleton className="h-3 w-20 mb-2" />
		<Skeleton className="h-8 w-16 mb-1" />
		<Skeleton className="h-3 w-24" />
	</div>
);
