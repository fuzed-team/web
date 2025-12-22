"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/features/auth/api/get-me";
import {
	type SortByOption,
	useUserMatchInfinite,
} from "@/features/matching/api/get-user-match";
import type { UniversityMatch } from "@/features/matching/components/user-match/university-match/university-match-tab";
import { PAGINATION } from "@/lib/constants/constant";
import { MatchCard } from "./match-card";
import { MatchesGridSkeleton } from "./matches-grid-skeleton";

interface MatchesGridProps {
	activePhotoId?: string | null;
	sortBy?: SortByOption;
	initialLoading?: boolean;
}

export function MatchesGrid({
	activePhotoId,
	sortBy = "highest_percentage",
	initialLoading,
}: MatchesGridProps) {
	const user = useUser();
	const { ref, inView } = useInView();
	const schoolName = user?.school || "University";

	const {
		data: userMatches,
		isLoading,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
	} = useUserMatchInfinite({
		input: {
			faceId: activePhotoId!,
			limit: PAGINATION.DEFAULT_LIMIT,
			sortBy,
		},
		queryConfig: {
			enabled: !!activePhotoId,
		},
	});

	const matches: UniversityMatch[] =
		userMatches && userMatches.length > 0 ? userMatches : [];

	useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, inView, hasNextPage]);

	if (isLoading || initialLoading) {
		return (
			<>
				<div className="mb-6 space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-80" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{Array.from({ length: 8 }).map((_, i) => (
						<MatchesGridSkeleton key={i} />
					))}
				</div>
			</>
		);
	}

	if (matches.length === 0 && !isLoading) {
		return (
			<div className="flex flex-col items-center justify-center py-20 px-4 text-center">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="space-y-4 max-w-md"
				>
					<TextShimmer
						className="text-2xl font-bold tracking-tight uppercase text-primary/60 [--base-color:#71717a] [--base-gradient-color:#ffffff] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]"
						duration={1}
					>
						Process Matching
					</TextShimmer>

					<p className="text-muted-foreground text-sm leading-relaxed px-4">
						Our AI is searching through profiles at{" "}
						<span className="text-primary font-semibold underline decoration-primary/20 underline-offset-4">
							{schoolName}
						</span>{" "}
						to find your most compatible genetic matches.
					</p>

					<div className="flex items-center justify-center gap-2 pt-4">
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								animate={{
									scale: [1, 1.4, 1],
									opacity: [0.3, 1, 0.3],
								}}
								transition={{
									duration: 1.2,
									repeat: Infinity,
									delay: i * 0.2,
								}}
								className="w-1.5 h-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(var(--primary),0.4)]"
							/>
						))}
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<>
			<div className="mb-6">
				<h2 className="md:text-2xl text-xl font-semibold tracking-tight text-foreground">
					Your Daily Matches at{" "}
					<span className="bg-gradient-to-r bg-clip-text text-transparent from-primary to-purple-600">
						{schoolName}
					</span>
				</h2>
				<p className="text-muted-foreground mt-1 text-sm">
					Click on a match card to view the match percentage and generate a baby
					together.
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{matches.map((match, i) => (
					<MatchCard key={`${match.id}-${i}`} match={match} index={i} />
				))}
				{hasNextPage && (
					<div ref={ref} className="col-span-full h-10">
						{isFetchingNextPage && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								<MatchesGridSkeleton />
								<MatchesGridSkeleton />
								<MatchesGridSkeleton />
								<MatchesGridSkeleton />
								<div className="col-span-full h-10" />
							</div>
						)}
					</div>
				)}
			</div>
		</>
	);
}
