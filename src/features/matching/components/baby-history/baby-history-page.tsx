"use client";

import { useBabyListInfinite } from "@/features/matching/api/get-baby-list";
import { useCelebrityBabyListInfinite } from "@/features/matching/api/get-celebrity-baby-list";
import { Baby, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { BabyHistorySkeleton } from "./baby-history-skeleton";
import { CelebrityGenerationCard } from "./celebrity-generation-card";
import { GenerationCard } from "./generation-card";
import { GenerationCardSkeleton } from "./generation-card-skeleton";

type TabType = "personal" | "celebrity";

export function BabyHistoryPage() {
	const [activeTab, setActiveTab] = useState<TabType>("personal");

	const { ref: personalRef, inView: personalInView } = useInView();
	const { ref: celebrityRef, inView: celebrityInView } = useInView();

	const {
		data: babyData,
		isLoading: isLoadingPersonal,
		isFetchingNextPage: isFetchingNextPersonal,
		fetchNextPage: fetchNextPersonal,
		hasNextPage: hasNextPersonal,
	} = useBabyListInfinite({
		input: { skip: 0, limit: 12 },
	});

	const {
		data: celebrityData,
		isLoading: isLoadingCelebrity,
		isFetchingNextPage: isFetchingNextCelebrity,
		fetchNextPage: fetchNextCelebrity,
		hasNextPage: hasNextCelebrity,
	} = useCelebrityBabyListInfinite({
		input: { skip: 0, limit: 12 },
	});

	const babies = babyData?.items ?? [];
	const celebrityBabies = celebrityData?.items ?? [];

	const isCurrentLoading =
		activeTab === "personal" ? isLoadingPersonal : isLoadingCelebrity;
	const currentBabies = activeTab === "personal" ? babies : celebrityBabies;
	const totalCount =
		activeTab === "personal"
			? (babyData?.total ?? 0)
			: (celebrityData?.total ?? 0);

	// Infinite scroll effect for personal tab
	React.useEffect(() => {
		if (personalInView && hasNextPersonal && activeTab === "personal") {
			fetchNextPersonal();
		}
	}, [personalInView, hasNextPersonal, fetchNextPersonal, activeTab]);

	// Infinite scroll effect for celebrity tab
	React.useEffect(() => {
		if (celebrityInView && hasNextCelebrity && activeTab === "celebrity") {
			fetchNextCelebrity();
		}
	}, [celebrityInView, hasNextCelebrity, fetchNextCelebrity, activeTab]);

	if (isCurrentLoading) {
		return (
			<section className="max-w-7xl w-full mx-auto px-6 py-8 md:px-10">
				<BabyHistorySkeleton activeTab={activeTab} />
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
						{totalCount} Total
					</span>
				</div>
			</div>

			{/* Tabs Section */}
			<div className="flex items-center border-b border-border mb-6">
				<nav className="flex space-x-8" aria-label="Tabs">
					<button
						type="button"
						onClick={() => setActiveTab("personal")}
						className={`py-4 px-1 text-base font-medium border-b-2 transition-colors ${
							activeTab === "personal"
								? "border-foreground text-foreground"
								: "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground/80"
						}`}
						aria-current={activeTab === "personal" ? "page" : undefined}
					>
						Personal
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("celebrity")}
						className={`group flex items-center py-4 px-1 text-base font-medium border-b-2 transition-colors ${
							activeTab === "celebrity"
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:border-primary/50 hover:text-primary/80"
						}`}
						aria-current={activeTab === "celebrity" ? "page" : undefined}
					>
						Celebrity Match
					</button>
				</nav>
			</div>

			{/* Empty State */}
			{currentBabies.length === 0 ? (
				<div className="text-center py-20">
					<div
						className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
							activeTab === "celebrity" ? "bg-primary/10" : "bg-primary/10"
						}`}
					>
						{activeTab === "celebrity" ? (
							<Sparkles className="w-8 h-8 text-primary" />
						) : (
							<Baby className="w-8 h-8 text-primary" />
						)}
					</div>
					<h2 className="text-xl font-semibold text-foreground mb-2">
						{activeTab === "celebrity"
							? "No celebrity baby generations yet"
							: "No baby generations yet"}
					</h2>
					<p className="text-muted-foreground max-w-sm mx-auto">
						{activeTab === "celebrity"
							? "Generate your first baby with a celebrity! Match with the celebrity of the day and create your future baby."
							: "Generate your first baby prediction to see it here. Match with someone and create your future baby!"}
					</p>
				</div>
			) : (
				/* Generation Grid */
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
					{activeTab === "personal" ? (
						<>
							{babies.map((baby) => (
								<GenerationCard key={baby.id} baby={baby} />
							))}
							{!isFetchingNextPersonal && (
								<div ref={personalRef} className="h-10" />
							)}
						</>
					) : (
						<>
							{celebrityBabies.map((baby) => (
								<CelebrityGenerationCard key={baby.id} baby={baby} />
							))}
							{!isFetchingNextCelebrity && (
								<div ref={celebrityRef} className="h-10" />
							)}
						</>
					)}

					{/* Loading skeletons for infinite scroll */}
					{(activeTab === "personal"
						? isFetchingNextPersonal
						: isFetchingNextCelebrity) && (
						<>
							{Array.from({ length: 4 }).map((_, index) => (
								<GenerationCardSkeleton key={`loading-${index}`} />
							))}
						</>
					)}
				</div>
			)}
		</section>
	);
}
