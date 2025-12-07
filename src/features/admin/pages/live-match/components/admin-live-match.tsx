"use client";

import { motion } from "framer-motion";
import React from "react";
import { useInView } from "react-intersection-observer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveMatchInfinite } from "@/features/matching/api/get-live-match";
import { useMatchStats } from "@/features/matching/api/get-match-stats";
import { AdminMatchCard } from "./admin-match-card";
import { MatchCardSkeleton } from "./match-card-skeleton";
import { StatCard } from "./stat-card";
import { StatCardSkeleton } from "./stat-card-skeleton";

export function AdminLiveMatch() {
	const { ref, inView } = useInView();

	const {
		data: liveMatchData,
		isLoading,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		error,
	} = useLiveMatchInfinite({
		input: {
			skip: 0,
			limit: 24,
		},
	});

	const allMatches = liveMatchData || [];

	// Fetch accurate stats from server
	const { data: statsData, isLoading: isLoadingStats } = useMatchStats();

	React.useEffect(() => {
		if (inView && hasNextPage) {
			fetchNextPage();
		}
	}, [fetchNextPage, inView, hasNextPage]);

	return (
		<ScrollArea className="h-full">
			{/* Quick Stats Row */}
			<motion.div
				className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				{isLoadingStats ? (
					<>
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
						<StatCardSkeleton />
					</>
				) : (
					<>
						<StatCard
							label="Total Matches"
							value={statsData?.total ?? 0}
							subtitle="All time"
						/>
						<StatCard
							label="Babies Generated"
							value={statsData?.babiesCount ?? 0}
							subtitle="AI generated"
						/>
						<StatCard
							label="Connections"
							value={statsData?.connectionsCount ?? 0}
							subtitle="Users chatting"
						/>
						<StatCard
							label="Active Users"
							value={statsData?.activeUsers ?? 0}
							subtitle="Registered profiles"
						/>
					</>
				)}
			</motion.div>

			{/* Live Feed Header */}
			<motion.div
				className="mb-4 flex items-center justify-between"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
					Happening Now
				</h3>
			</motion.div>

			{/* Match Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
				{isLoading ? (
					// Show skeleton cards while loading
					Array.from({ length: 6 }).map((_, index) => (
						<MatchCardSkeleton key={index} />
					))
				) : error ? (
					<div className="col-span-full text-center py-8 text-destructive">
						<p>Failed to load matches. Please try again.</p>
					</div>
				) : allMatches.length > 0 ? (
					<>
						{allMatches.map((match, index) => (
							<AdminMatchCard
								key={match.id + index}
								data={match}
								index={index}
							/>
						))}
						{!isFetchingNextPage && <div ref={ref} className="h-10" />}
					</>
				) : (
					<div className="col-span-full text-center py-8 text-muted-foreground">
						<p>No matches found.</p>
					</div>
				)}

				{isFetchingNextPage && (
					<>
						{Array.from({ length: 3 }).map((_, index) => (
							<MatchCardSkeleton key={`loading-${index}`} />
						))}
						<div className="h-10" />
					</>
				)}
			</div>
		</ScrollArea>
	);
}
