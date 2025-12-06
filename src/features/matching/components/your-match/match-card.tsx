"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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

	console.log(match);

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
			className="group bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-xl dark:hover:border-gray-700 hover:border-gray-300 transition-all duration-300 flex flex-col h-full"
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
									<div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold shadow-sm text-love border border-border">
										{item.matchPercentage}%
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					{/* Conditionally render navigation if more than 1 image */}
					{allMatchImages.length > 1 && (
						<>
							<CarouselPrevious className="left-2 bg-background/50 hover:bg-background border-none backdrop-blur-sm h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
							<CarouselNext className="right-2 bg-background/50 hover:bg-background border-none backdrop-blur-sm h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" />
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

			<div className="flex justify-between items-start mb-2">
				<div>
					<h4 className="text-lg font-semibold text-card-foreground leading-tight mb-1">
						{match.other.name}
					</h4>
					<p className="text-sm text-muted-foreground">
						Matched with {match.numberOfMatches} of your photos
					</p>
				</div>
			</div>

			{/* Generate Baby Button */}
			<div className="mt-auto space-y-2">
				<button
					type="button"
					className="w-full py-2 rounded-lg bg-gradient-to-r dark:from-love/30 dark:to-primary/30 from-love/10 to-primary/10 text-love dark:text-love/90 border border-love/20 dark:border-love/50 text-xs font-medium flex items-center justify-center gap-2 hover:brightness-95 transition-all"
					onClick={() => {
						onOpen(
							{
								user1: { name: match.me.name, photo: match.me.image },
								user2: {
									name: match.other.name,
									photo: match.matches[current - 1].image,
								},
							},
							match.matches[current - 1].id,
						);
					}}
				>
					<Sparkles className="size-4" />
					Generate Baby
				</button>
			</div>
		</motion.div>
	);
}
