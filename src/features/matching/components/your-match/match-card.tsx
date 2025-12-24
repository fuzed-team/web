"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BlurImage } from "@/components/blur-image";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import type { UniversityMatch } from "@/features/matching/components/user-match/university-match/university-match-tab";
import { useUserMatchesActions } from "../../store/user-matches";

export function MatchCard({
	match,
	index,
}: {
	match: UniversityMatch;
	index: number;
}) {
	const { onOpen } = useUserMatchesActions();
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	const allMatchImages = [
		...match.matches.map((m, idx) => ({
			image: m.image,
			matchPercentage: m.matchPercentage,
			id: `image-${idx}`,
		})),
	];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{
				duration: 0.8,
				delay: 0.1 + (index % 3) * 0.1,
				ease: [0.16, 1, 0.3, 1],
			}}
			className="group relative aspect-[4/5] rounded-2xl overflow-hidden dark:bg-[#1A1D24] bg-slate-100 border dark:border-white/5 border-slate-200 shadow-sm cursor-pointer hover:border-violet-500/50 transition-all"
			onClick={() => {
				const currentIdx = current > 0 ? current - 1 : 0;
				onOpen(
					{
						user1: { name: match.me.name, photo: match.me.image },
						user2: {
							name: match.other.name,
							photo: match.matches[currentIdx].image,
						},
						matchPercentage: match.matches[currentIdx].matchPercentage,
					},
					match.matches[currentIdx].id,
				);
			}}
		>
			<Carousel setApi={setApi} className="w-full h-full">
				<CarouselContent
					className="w-full h-full ml-0"
					containerClassName="w-full h-full"
				>
					{allMatchImages.map((item, idx) => (
						<CarouselItem key={idx} className="w-full h-full pl-0">
							<div className="relative w-full h-full overflow-hidden">
								<BlurImage
									src={item.image}
									className="w-full h-full object-cover dark:opacity-80 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
									alt={match.other.name}
									width={600}
									height={750}
								/>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>

				{/* Overlay Gradient */}
				<div className="absolute inset-0 bg-linear-to-t from-black/60 dark:from-black/80 via-transparent to-transparent pointer-events-none" />

				{/* Info Overlay */}
				<div className="absolute bottom-4 left-4 right-4 z-10">
					<p className="text-white font-medium text-lg">{match.other.name}</p>
					<div className="flex items-center justify-between gap-2 mt-0.5">
						<p className="text-slate-400 text-xs">{match.timestamp}</p>
						{match.numberOfMatches > 1 && (
							<span className="text-white/90 text-[10px] bg-white/10 dark:bg-white/15 backdrop-blur-[2px] px-2 py-0.5 rounded-full border border-white/10 transition-colors group-hover:bg-white/20">
								{match.numberOfMatches} photos
							</span>
						)}
					</div>
				</div>

				{/* Navigation Overlay */}
				{allMatchImages.length > 1 && (
					<>
						<CarouselPrevious
							className="left-2 bg-black/20 hover:bg-black/40 border-none backdrop-blur-sm h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
						<CarouselNext
							className="right-2 bg-black/20 hover:bg-black/40 border-none backdrop-blur-sm h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
						<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
							{Array.from({ length: count }).map((_, idx) => (
								<div
									key={idx}
									className={`h-1 w-4 rounded-full transition-all duration-300 ${
										idx === current - 1
											? "bg-white"
											: "dark:bg-white/30 bg-black/20"
									}`}
								/>
							))}
						</div>
					</>
				)}
			</Carousel>
		</motion.div>
	);
}
