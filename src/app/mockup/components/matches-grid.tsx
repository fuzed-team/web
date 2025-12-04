"use client";

import { motion } from "framer-motion";

const matches = [
	{
		name: "Genroiel",
		image:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500&auto=format&fit=crop",
		score: "93%",
		otherMatches: [
			{
				image:
					"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=150&auto=format&fit=crop",
				score: "85%",
			},
			{
				image:
					"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
				score: "72%",
			},
		],
		extraCount: 2,
	},
	{
		name: "Matha O.",
		image:
			"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=500&auto=format&fit=crop",
		score: "92%",
		otherMatches: [
			{
				image:
					"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
				score: "88%",
			},
		],
	},
	{
		name: "Maria E.",
		image:
			"https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=500&auto=format&fit=crop",
		score: "97%",
		singleMatch: true,
	},
	{
		name: "Shana K.",
		image:
			"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=500&auto=format&fit=crop",
		score: "98%",
		otherMatches: [
			{
				image:
					"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop",
				score: "81%",
			},
			{
				image:
					"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
				score: "60%",
			},
		],
	},
	{
		name: "Davor",
		image:
			"https://images.unsplash.com/photo-1480455624313-e29b44bbfde1?q=80&w=500&auto=format&fit=crop",
		score: "92%",
		singleMatch: true,
	},
	{
		name: "Damiel J.",
		image:
			"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=500&auto=format&fit=crop",
		score: "93%",
		otherMatches: [
			{
				image:
					"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=150&auto=format&fit=crop",
				score: "70%",
			},
		],
	},
	{
		name: "Sarah L.",
		image:
			"https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=500&auto=format&fit=crop",
		score: "89%",
		otherMatches: [
			{
				image:
					"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
				score: "75%",
			},
		],
	},
];

export function MatchesGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{matches.map((match, i) => (
				<motion.div
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={i}
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
							src={match.image}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
							alt="Profile"
						/>
						<div className="absolute top-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold shadow-sm text-pink-600 border border-border">
							{match.score}
						</div>
					</div>

					<div className="flex justify-between items-start mb-2">
						<div>
							<h4 className="text-lg font-semibold text-card-foreground leading-none">
								{match.name}
							</h4>
						</div>
					</div>

					{/* Alternate Matches Row */}
					<div className="mt-auto pt-3 border-t border-border">
						{match.singleMatch ? (
							<p className="text-[10px] uppercase font-semibold mb-2 tracking-wide opacity-50 text-muted-foreground">
								Single strong match
							</p>
						) : (
							<>
								<p className="text-[10px] uppercase font-semibold mb-2 tracking-wide text-muted-foreground">
									Matches with her other photos
								</p>
								<div className="flex items-center gap-2">
									{match.otherMatches?.map((other, j) => (
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
												{other.score}
											</div>
										</div>
									))}
									{match.extraCount && (
										<div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
											+{match.extraCount}
										</div>
									)}
								</div>
							</>
						)}
					</div>
				</motion.div>
			))}
		</div>
	);
}
