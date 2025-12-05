"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useUserMatchInfinite } from "@/features/matching/api/get-user-match";
import type { UniversityMatch } from "@/features/matching/components/user-match/university-match/university-match-tab";
import { PAGINATION } from "@/lib/constants/constant";
import { MatchesGridSkeleton } from "./matches-grid-skeleton";

interface MatchesGridProps {
	activePhotoId?: string | null;
}

export function MatchesGrid({ activePhotoId }: MatchesGridProps) {
	const { ref, inView } = useInView();

	const {
		data: userMatches,
		isLoading,
		isFetchingNextPage,
		fetchNextPage,
	} = useUserMatchInfinite({
		input: {
			faceId: activePhotoId!,
			limit: PAGINATION.DEFAULT_LIMIT,
		},
		queryConfig: {
			enabled: !!activePhotoId,
		},
	});

	const matches: UniversityMatch[] =
		userMatches && userMatches.length > 0 ? userMatches : [];

	useEffect(() => {
		if (inView) {
			fetchNextPage();
		}
	}, [fetchNextPage, inView]);

	if (isLoading) {
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
					No Matches Found
				</h3>
				<p className="text-gray-500">
					Select a photo to see your matches or check back later.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{matches.map((match, i) => (
				<motion.div
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={`${match.id}-${i}`}
					initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
					animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
					transition={{
						duration: 0.8,
						delay: 0.1 + (i % 3) * 0.1,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="group bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col h-full"
				>
					{/* Main Match Image */}
					<div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-3 bg-muted group-hover:ring-2 ring-primary/50 transition-all">
						<img
							src={match.other.image}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
							alt={match.other.name}
						/>
						<div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold shadow-sm text-pink-600 border border-border">
							{match.matchPercentage}%
						</div>
					</div>

					<div className="flex justify-between items-start mb-2">
						<div>
							<h4 className="text-lg font-semibold text-card-foreground leading-none">
								{match.other.name}
							</h4>
						</div>
					</div>

					{/* Alternate Matches Row */}
					<div className="mt-auto pt-3 border-t border-border">
						{match.matches.length === 0 ? (
							<p className="text-[10px] uppercase font-semibold mb-2 tracking-wide opacity-50 text-muted-foreground">
								Single strong match
							</p>
						) : (
							<>
								<p className="text-[10px] uppercase font-semibold mb-2 tracking-wide text-muted-foreground">
									Matches with her other photos
								</p>
								<div className="flex items-center gap-2">
									{match.matches.slice(0, 3).map((other, j) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={j}
											className="relative w-10 h-10 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
										>
											<img
												src={other.image}
												className="w-full h-full object-cover opacity-80 hover:opacity-100"
												alt="Other match"
											/>
											<div className="absolute bottom-0 w-full text-[8px] text-center font-medium py-0.5 bg-black/60 text-white">
												{other.matchPercentage}%
											</div>
										</div>
									))}
									{match.matches.length > 3 && (
										<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
											+{match.matches.length - 3}
										</div>
									)}
								</div>
							</>
						)}
					</div>
				</motion.div>
			))}
			<div ref={ref} className="col-span-full h-10 flex justify-center">
				{isFetchingNextPage && (
					<div className="flex gap-4 w-full">
						<MatchesGridSkeleton />
						<MatchesGridSkeleton />
						<MatchesGridSkeleton />
						<MatchesGridSkeleton />
					</div>
				)}
			</div>
		</div>
	);
}
