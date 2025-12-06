"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BlurImage } from "@/components/blur-image";

import { cn } from "@/lib/utils";
import { calculateMatchPercentage } from "@/lib/utils/match-percentage";

interface FeaturedCelebrity {
	celebrity: {
		id: string;
		name: string;
		bio: string;
		category: string;
		image_path: string;
		image_url: string;
		featured_until: string;
	};
	similarity_score: number;
	is_featured: boolean;
}

interface CelebrityOfTheDayCardProps {
	faceId: string | null;
	className?: string;
	initialLoading?: boolean;
}

async function fetchFeaturedCelebrity(
	faceId: string | null,
): Promise<FeaturedCelebrity | null> {
	if (!faceId) return null; // No face selected yet

	const response = await fetch(
		`/api/matches/celebrity/featured?face_id=${faceId}`,
	);
	if (!response.ok) {
		if (response.status === 404 || response.status === 400) return null;
		throw new Error("Failed to fetch featured celebrity");
	}
	return response.json();
}

export function CelebrityOfTheDayCard({
	faceId,
	className,
	initialLoading,
}: CelebrityOfTheDayCardProps) {
	const [timeLeft, setTimeLeft] = useState("");

	const { data, isLoading, error } = useQuery({
		queryKey: ["featured-celebrity", faceId],
		queryFn: () => fetchFeaturedCelebrity(faceId),
		enabled: !!faceId, // Only fetch when faceId is available
		staleTime: 1000 * 60 * 30, // 30 minutes
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (!data?.celebrity?.featured_until) return;

		const updateTimer = () => {
			const now = Date.now();
			const end = new Date(data.celebrity.featured_until).getTime();
			const diff = end - now;

			if (diff <= 0) {
				setTimeLeft("Expired");
				return;
			}

			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			setTimeLeft(`${hours}h ${minutes}m left`);
		};

		updateTimer();
		const interval = setInterval(updateTimer, 60000); // Update every minute

		return () => clearInterval(interval);
	}, [data]);

	if (isLoading || initialLoading) {
		return (
			<div className="md:p-10 overflow-hidden w-full rounded-3xl mb-10 pt-8 pr-8 pb-8 pl-8 relative shadow-2xl shadow-purple-900/20 text-white bg-gradient-to-r from-violet-900 via-purple-800 to-blue-800 animate-pulse">
				<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
					<div className="max-w-xl w-full space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
						<div className="h-7 w-48 bg-white/10 rounded-full" />
						<div className="h-10 w-72 bg-white/10 rounded-lg" />
						<div className="space-y-3 w-full max-w-md">
							<div className="h-5 w-full bg-white/10 rounded" />
							<div className="h-4 w-3/4 bg-white/10 rounded" />
							<div className="h-10 w-5/6 bg-white/10 rounded mt-2" />
						</div>
					</div>

					<div className="flex-shrink-0 relative">
						<div className="w-48 h-48 md:w-56 md:h-56 bg-white/10 rounded-2xl border-4 border-white/5" />
					</div>
				</div>
			</div>
		);
	}

	// Don't show anything if there's an error or no celebrity
	if (error || !data) return null;

	const matchPercentage = calculateMatchPercentage(data.similarity_score);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
			className={cn(
				"md:p-10 overflow-hidden group bg-gradient-to-r w-full rounded-3xl mb-10 pt-8 pr-8 pb-8 pl-8 relative shadow-2xl shadow-purple-900/20 text-white from-violet-900 via-purple-800 to-blue-800",
				className,
			)}
		>
			<div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

			<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
				<div className="max-w-xl space-y-4 text-center md:text-left">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border text-xs font-medium border-purple-400/30 text-purple-100">
						<span className="w-2 h-2 rounded-full animate-pulse bg-pink-400" />
						Daily Featured Match
					</div>
					<h3 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
						Celebrity Match of the Day
					</h3>
					<p className="text-base md:text-lg font-light leading-relaxed max-w-md mx-auto md:mx-0 text-purple-100">
						Discover the daily featured celebrity similarity match.
						{data.celebrity.bio && (
							<span className="block mt-2 text-sm opacity-80 line-clamp-2">
								{data.celebrity.bio}
							</span>
						)}
					</p>
				</div>

				<div className="flex-shrink-0 relative">
					<div className="absolute -top-4 -right-4 z-20 text-center animate-bounce duration-1000">
						<span className="inline-block px-3 py-1 font-bold rounded-lg shadow-lg text-lg bg-white text-purple-900">
							{matchPercentage}%
						</span>
					</div>
					<div className="relative w-48 h-48 md:w-56 md:h-56">
						<BlurImage
							src={data.celebrity.image_url}
							alt={data.celebrity.name}
							width={224}
							height={224}
							className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/10"
						/>
						<div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent rounded-b-2xl">
							<p className="text-center font-semibold text-sm">
								{data.celebrity.name}
							</p>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
