"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BlurImage } from "@/components/blur-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

export function CelebrityOfTheDayCard({ faceId }: CelebrityOfTheDayCardProps) {
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
			<Card className="mb-6 animate-pulse bg-gradient-to-r from-purple-50 to-pink-50">
				<div className="p-6">
					<div className="h-24 bg-gray-200 rounded"></div>
				</div>
			</Card>
		);
	}

	// Don't show anything if there's an error or no celebrity
	if (error || !data) return null;

	const matchPercentage = calculateMatchPercentage(data.similarity_score);

	return (
		<Card className="py-0 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
			<div className="p-6">
				{/* Header */}
				<div className="flex items-center justify-between mb-4">
					<Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 text-sm font-semibold shadow-md">
						⭐ Celebrity of the Day
					</Badge>
					{/* <span className="text-sm text-purple-700 font-medium">
            {timeLeft}
          </span> */}
				</div>

				{/* Content */}
				<div className="flex gap-6 items-center">
					{/* Celebrity Image */}
					<div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-xl">
						<BlurImage
							src={data.celebrity.image_url}
							alt={data.celebrity.name}
							fill
							className="object-cover"
						/>
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
							{data.celebrity.name}
						</h3>
						<p className="text-sm text-purple-600 font-medium capitalize mb-3">
							{data.celebrity.category}
						</p>

						{/* Match Score */}
						<div className="flex items-baseline gap-2 mb-2">
							<span className="text-3xl font-bold text-purple-600">
								{matchPercentage}%
							</span>
							<span className="text-sm text-gray-600">Match</span>
						</div>

						{/* Bio */}
						{data.celebrity.bio && (
							<p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
								{data.celebrity.bio}
							</p>
						)}
					</div>
				</div>
			</div>
		</Card>
	);
}
