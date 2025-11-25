"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BlurImage } from "@/components/blur-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

	if (isLoading) {
		return (
			<Card className="py-0 animate-pulse bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300">
				<div className="p-4">
					{/* Badge skeleton */}
					<div className="mb-3">
						<div className="h-6 w-40 bg-purple-200 rounded-full"></div>
					</div>

					{/* Content skeleton */}
					<div className="flex gap-4 items-start">
						{/* Image skeleton */}
						<div className="w-20 h-20 flex-shrink-0 rounded-full bg-purple-200"></div>

						{/* Info skeleton */}
						<div className="flex-1 space-y-2">
							<div className="h-5 bg-purple-200 rounded w-3/4"></div>
							<div className="h-4 bg-purple-200 rounded w-1/3"></div>
							<div className="h-8 bg-purple-200 rounded w-1/2"></div>
							<div className="h-4 bg-purple-200 rounded w-full"></div>
						</div>
					</div>
				</div>
			</Card>
		);
	}

	// Don't show anything if there's an error or no celebrity
	if (error || !data) return null;

	const matchPercentage = calculateMatchPercentage(data.similarity_score);

	return (
		<Card
			className={cn(
				"py-0 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-shadow duration-300",
				className,
			)}
		>
			<div className="p-4">
				{/* Header Badge - Top left */}
				<div className="mb-3">
					<Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 text-xs font-semibold shadow-md">
						⭐ Celebrity of the Day
					</Badge>
				</div>

				{/* Content - Horizontal layout */}
				<div className="flex gap-4 items-start">
					{/* Celebrity Image */}
					<div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-4 border-white shadow-xl">
						<BlurImage
							src={data.celebrity.image_url}
							alt={data.celebrity.name}
							fill
							className="object-cover"
						/>
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<h3 className="text-lg font-bold text-gray-900 mb-0.5">
							{data.celebrity.name}
						</h3>
						<p className="text-xs text-purple-600 font-medium capitalize mb-2">
							{data.celebrity.category}
						</p>

						{/* Match Score */}
						<div className="flex items-baseline gap-1.5 mb-2">
							<span className="text-3xl font-bold text-purple-600">
								{matchPercentage}%
							</span>
							<span className="text-xs text-gray-600 uppercase">Match</span>
						</div>

						{/* Bio */}
						{data.celebrity.bio && (
							<p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
								{data.celebrity.bio}
							</p>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}
