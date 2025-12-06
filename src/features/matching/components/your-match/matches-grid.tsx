"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
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
	const { ref, inView } = useInView();

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
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{Array.from({ length: 8 }).map((_, i) => (
					<MatchesGridSkeleton key={i} />
				))}
			</div>
		);
	}

	if (!isLoading && matches.length === 0) {
		return (
			<div className="text-center py-12">
				<h3 className="text-xl font-semibold text-gray-600 mb-2">
					Processing Matches...
				</h3>
				<p className="text-gray-500">
					We're currently analyzing your photo to find your suitable matches.
					This usually takes just a few minutes.
				</p>
			</div>
		);
	}

	return (
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
	);
}
