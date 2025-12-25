"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BlurImage } from "@/components/blur-image";

import { cn } from "@/lib/utils";
import { calculateMatchPercentage } from "@/lib/utils/match-percentage";
import { useCelebrityBabyActions } from "../../store/celebrity-baby-store";

interface FeaturedCelebrity {
	id: string; // celebrity_match_id for baby generation
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
	userPhoto?: string | null;
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
	userPhoto,
	className,
	initialLoading,
}: CelebrityOfTheDayCardProps) {
	const [timeLeft, setTimeLeft] = useState("");
	const { onOpen: openBabyDialog } = useCelebrityBabyActions();

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
			<div className="mb-10 w-full bg-linear-to-br from-[#4c1d95] via-[#4338ca] to-[#2e2382] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 relative gap-6 md:gap-4 border border-white/10 animate-pulse">
				{/* Skeleton Left Section */}
				<div className="flex-1 flex flex-col items-center md:items-start space-y-6 w-full max-w-md">
					<div className="space-y-3">
						<div className="h-6 w-24 bg-white/10 rounded-full" />
						<div className="h-12 w-64 bg-white/10 rounded-xl" />
					</div>
					<div className="space-y-2 w-full">
						<div className="h-6 w-48 bg-white/10 rounded-lg" />
						<div className="h-4 w-56 bg-white/10 rounded-lg" />
					</div>
					<div className="h-12 w-40 bg-white/10 rounded-2xl" />
				</div>

				{/* Skeleton Center Section */}
				<div className="flex-shrink-0 order-first md:order-0">
					<div className="w-64 h-64 md:w-72 md:h-72 bg-white/5 rounded-2xl border-4 border-white/5" />
				</div>

				{/* Skeleton Right Section */}
				<div className="flex flex-col items-center md:items-end space-y-4 min-w-[160px]">
					<div className="h-4 w-16 bg-white/10 rounded" />
					<div className="h-16 w-24 bg-white/10 rounded-xl" />
					<div className="h-2 w-32 bg-white/10 rounded-full" />
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
				"mb-10 w-full bg-linear-to-br from-[#4c1d95] via-[#4338ca] to-[#2e2382] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 relative gap-6 md:gap-4 border border-white/10 shadow-indigo-900/20 text-white group",
				className,
			)}
		>
			{/* Background Glow Effects */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-overlay" />
				<div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] mix-blend-overlay" />
			</div>

			{/* Left Section: Content */}
			<div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 space-y-6 max-w-md">
				<div className="space-y-3">
					{/* Badge */}
					<div className="flex justify-center md:justify-start">
						<span className="inline-flex items-center text-xs font-medium text-white/90 bg-white/10 border border-white/10 rounded-full px-3 py-1 backdrop-blur-md shadow-sm">
							Daily Pick
						</span>
					</div>

					{/* Title */}
					<h3 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.1]">
						Celebrity Match
					</h3>
				</div>

				{/* Description */}
				<div className="space-y-2">
					{data.celebrity.bio && (
						<p className="text-sm font-medium text-white/50 max-w-[460px] mx-auto md:mx-0">
							{data.celebrity.bio}
						</p>
					)}
				</div>

				{/* Action Button */}
				<button
					type="button"
					onClick={() => {
						if (data.id && userPhoto) {
							openBabyDialog(
								{
									id: data.id,
									celeb: {
										id: data.celebrity.id,
										name: data.celebrity.name,
										image: data.celebrity.image_url,
										school: null,
										bio: data.celebrity.bio,
										category: data.celebrity.category,
									},
									matchPercentage,
									timestamp: "now",
									isNew: true,
									isFavorited: false,
								},
								userPhoto,
							);
						}
					}}
					className="group relative inline-flex items-center justify-center gap-2.5 bg-linear-to-r from-primary to-purple-500 hover:opacity-90 text-primary-foreground px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 hover:-translate-y-0.5 w-full md:w-auto overflow-hidden"
				>
					<div className="transition-opacity duration-300 bg-white/20 absolute inset-0 overflow-hidden">
						<div className="pointer-events-none absolute inset-0 z-0">
							{/* Floating bubbles animation */}
							{[...Array(10)].map((_, i) => (
								<motion.div
									key={i}
									className="absolute bottom-[-10px] h-0.5 w-0.5 rounded-full bg-white"
									initial={{
										y: 0,
										opacity: 0.5 + Math.random() * 0.5,
										left: `${Math.random() * 100}%`,
									}}
									animate={{
										y: -60,
										opacity: 0,
									}}
									transition={{
										duration: 1.5 + Math.random() * 1.5,
										repeat: Infinity,
										delay: Math.random() * 2,
										ease: "easeInOut",
									}}
								/>
							))}
						</div>
					</div>
					<span className="text-sm font-semibold tracking-wide relative z-10">
						Generate Baby
					</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="lucide lucide-sparkles z-10 relative w-[16px] h-[16px]"
					>
						<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
						<path d="M20 2v4" />
						<path d="M22 4h-4" />
						<circle cx="4" cy="20" r="2" />
					</svg>
				</button>
			</div>

			{/* Center Section: Image */}
			<div className="flex-shrink-0 z-10 order-first md:order-0 mb-6 md:mb-0">
				<div className="relative w-64 h-64 md:w-72 md:h-72 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/5 md:-rotate-1 hover:rotate-0 transition-transform duration-500 ease-out group/img cursor-pointer">
					<BlurImage
						src={data.celebrity.image_url}
						alt={data.celebrity.name}
						width={288}
						height={288}
						className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 transition-opacity duration-500"
					/>
					{/* Gradient overlay on image */}
					<div className="absolute inset-0 bg-linear-to-t from-indigo-900/40 to-transparent mix-blend-overlay" />
				</div>
			</div>

			{/* Right Section: Stats */}
			<div className="flex flex-col items-center md:items-end text-center md:text-right z-10 space-y-1 min-w-[160px]">
				<span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-1">
					Match
				</span>
				<div className="flex items-start justify-end text-white leading-none">
					<span className="text-7xl font-bold tracking-tighter drop-shadow-sm">
						{matchPercentage}
					</span>
					<span className="text-3xl font-medium text-white/50 mt-1.5 ml-1">
						%
					</span>
				</div>

				{/* Progress Bar */}
				<div className="w-32 h-2 bg-white/10 rounded-full mt-4 overflow-hidden backdrop-blur-sm relative">
					{/* Glowing bar */}
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${matchPercentage}%` }}
						transition={{ duration: 1.5, ease: "easeOut" }}
						className="absolute top-0 left-0 h-full bg-linear-to-r from-primary to-purple-500 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)]"
					/>
				</div>
			</div>
		</motion.div>
	);
}
