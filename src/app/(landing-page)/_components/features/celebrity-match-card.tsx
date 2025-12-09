"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { SpotlightCard } from "@/components/spotlight-card";
import AnimationContainer from "../global/animation-container";

export function CelebrityMatchCard() {
	return (
		<AnimationContainer className="h-full grid" delay={0.4}>
			<SpotlightCard
				className="md:col-span-2 p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group shadow-xl shadow-purple-900/10 bg-[#080B16]"
				spotlightColor="rgba(99, 102, 241, 0.3)"
			>
				<div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
				<div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent pointer-events-none" />

				<div className="relative z-10 max-w-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
							<Star className="w-6 h-6" />
						</div>
					</div>
					<h3 className="text-xl font-medium mb-2 tracking-tight bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-transparent">
						Daily Celebrity Matches
					</h3>
					<p className="text-sm text-slate-400 leading-relaxed font-normal mb-6">
						Our background algorithms automatically process thousands of
						profiles every day. We identify the highest compatibility scores
						between users and celebrity archetypes.
					</p>
					<div className="flex gap-6 border-t border-white/5 pt-4">
						<div>
							<div className="text-2xl font-semibold text-slate-400">10k+</div>
							<div className="text-[10px] text-slate-500 uppercase font-medium">
								Daily Scans
							</div>
						</div>
						<div>
							<div className="text-2xl font-semibold text-purple-400">
								78.5%
							</div>
							<div className="text-[10px] text-slate-500 uppercase font-medium">
								Accuracy
							</div>
						</div>
					</div>
				</div>

				<div className="relative w-full md:w-72 h-56 flex items-center justify-center">
					<div className="absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-20" />
					{/* User Card */}
					<div className="relative w-24 h-32 bg-slate-800 rounded-lg -rotate-[6deg] z-10 border-2 border-slate-700 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:-rotate-[12deg] group-hover:translate-x-[-10px]">
						<Image
							src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
							alt="User"
							fill
							className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
						/>
						<div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[8px] text-center text-white font-medium">
							User
						</div>
					</div>
					{/* Heart Center */}
					<div className="w-12 h-12 rounded-full bg-[#1A1523] border border-purple-500/30 flex items-center justify-center text-purple-400 z-30 absolute shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md">
						<Heart className="w-5 h-5" />
					</div>
					{/* Celebrity Card */}
					<div className="relative w-24 h-32 bg-slate-800 rounded-lg rotate-[6deg] z-10 border-2 border-purple-500/50 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:rotate-[12deg] group-hover:translate-x-[10px] ring-2 ring-purple-500/20">
						<Image
							src="https://images.unsplash.com/photo-1618721405821-80ebc4b63d26?q=80&w=200&auto=format&fit=crop"
							alt="Celebrity"
							fill
							className="object-cover"
						/>
						<div className="absolute bottom-0 inset-x-0 bg-purple-600/80 p-1 text-[8px] text-center text-white font-medium">
							Celeb Match
						</div>
					</div>
				</div>
			</SpotlightCard>
		</AnimationContainer>
	);
}
