"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
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
			className="group bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-xl dark:hover:border-gray-700 hover:border-gray-300 transition-all duration-300 flex flex-col h-full cursor-pointer"
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
			{/* Carousel */}
			<div className="relative mb-3">
				<Carousel setApi={setApi} className="w-full">
					<CarouselContent>
						{allMatchImages.map((item, idx) => (
							<CarouselItem key={idx}>
								<div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted ring-primary/50 transition-all">
									<BlurImage
										src={item.image}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
										alt={match.other.name}
										width={248}
										height={310}
									/>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					{/* Conditionally render navigation if more than 1 image */}
					{allMatchImages.length > 1 && (
						<>
							<CarouselPrevious
								className="left-2 bg-background/50 hover:bg-background border-none backdrop-blur-sm h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
								onClick={(e) => e.stopPropagation()}
							/>
							<CarouselNext
								className="right-2 bg-background/50 hover:bg-background border-none backdrop-blur-sm h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
								onClick={(e) => e.stopPropagation()}
							/>
							<div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
								{Array.from({ length: count }).map((_, idx) => (
									<div
										key={idx}
										className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
											idx === current - 1
												? "bg-white scale-110"
												: "bg-white/50 hover:bg-white/80"
										}`}
									/>
								))}
							</div>
						</>
					)}
				</Carousel>
			</div>

			<div className="mb-0">
				<h4 className="text-lg font-semibold text-card-foreground leading-tight">
					{match.other.name}
				</h4>
				<div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mt-1">
					<span className="flex items-center gap-1 text-muted-foreground/70">
						<Clock className="size-3" />
						{match.timestamp}
					</span>
					{match.numberOfMatches > 1 && (
						<span className="flex items-center gap-1 text-muted-foreground/70">
							Matched {match.numberOfMatches} photos
						</span>
					)}
				</div>
			</div>
		</motion.div>
	);
}
