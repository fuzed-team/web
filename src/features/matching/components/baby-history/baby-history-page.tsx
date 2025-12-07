"use client";

import { Baby } from "lucide-react";
import { useBabyList } from "@/features/matching/api/get-baby-list";
import { BabyHistorySkeleton } from "./baby-history-skeleton";
import { GenerationCard } from "./generation-card";

export function BabyHistoryPage() {
	const { data: babies = [], isLoading } = useBabyList();

	if (isLoading) {
		return (
			<section className="max-w-7xl w-full mx-auto px-6 py-8 md:px-10">
				<BabyHistorySkeleton />
			</section>
		);
	}

	return (
		<section className="max-w-7xl w-full mx-auto px-6 py-8 md:px-10 md:pb-10 md:pt-0">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h2 className="md:text-2xl text-xl font-semibold tracking-tight text-foreground">
						Recent Generations
					</h2>
					<span className="px-2 py-0.5 rounded-full border text-[10px] text-muted-foreground bg-muted border-border">
						{babies.length} Total
					</span>
				</div>
				{/* <div className="flex items-center gap-2">
					<button
						type="button"
						className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
						aria-label="Filter"
					>
						<Filter className="w-4 h-4" />
					</button>
					<button
						type="button"
						className="p-1.5 text-muted-foreground transition-colors hover:text-foreground"
						aria-label="Sort"
					>
						<ArrowDownUp className="w-4 h-4" />
					</button>
				</div> */}
			</div>

			{/* Empty State */}
			{babies.length === 0 ? (
				<div className="text-center py-20">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
						<Baby className="w-8 h-8 text-primary" />
					</div>
					<h2 className="text-xl font-semibold text-foreground mb-2">
						No baby generations yet
					</h2>
					<p className="text-muted-foreground max-w-sm mx-auto">
						Generate your first baby prediction to see it here. Match with
						someone and create your future baby!
					</p>
				</div>
			) : (
				/* Generation Grid */
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
					{babies.map((baby) => (
						<GenerationCard key={baby.id} baby={baby} />
					))}
				</div>
			)}
		</section>
	);
}
