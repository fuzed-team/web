"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { SpotlightCard } from "@/components/spotlight-card";
import AnimationContainer from "../global/animation-container";

export function CelebrityMatchCard() {
	return (
		<AnimationContainer className="h-full grid" delay={0.4}>
			<SpotlightCard
				className="md:col-span-2 bg-gradient-to-br from-purple-50 via-white to-white border border-purple-100/50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300"
				spotlightColor="rgba(168, 85, 247, 0.15)"
			>
				<div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

				<div className="relative z-10 max-w-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-12 h-12 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600">
							<Star className="w-6 h-6" />
						</div>
					</div>
					<h3 className="text-xl font-medium mb-2 tracking-tight text-slate-900">
						Daily Celebrity Matches
					</h3>
					<p className="text-sm text-slate-500 leading-relaxed font-normal mb-6">
						Our background algorithms automatically process thousands of
						profiles every day. We identify the highest compatibility scores
						between users and celebrity archetypes.
					</p>
					<div className="flex gap-6 border-t border-purple-100 pt-4">
						<div>
							<div className="text-2xl font-semibold text-slate-900">10k+</div>
							<div className="text-[10px] text-slate-500 uppercase font-medium">
								Daily Scans
							</div>
						</div>
						<div>
							<div className="text-2xl font-semibold text-purple-600">
								78.5%
							</div>
							<div className="text-[10px] text-slate-500 uppercase font-medium">
								Accuracy
							</div>
						</div>
					</div>
				</div>

				<div className="relative w-full md:w-72 h-56 flex items-center justify-center perspective-midrange">
					{/* Visual Elements adjusted for light theme */}
					<div className="absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-purple-300 to-transparent z-20" />
					<div className="relative w-24 h-32 bg-white rounded-lg -rotate-[6deg] z-10 border-2 border-white shadow-xl transition-transform duration-500 group-hover:-rotate-[12deg] group-hover:translate-x-[-10px]">
						<Image
							src="/images/mock-images/boy-4.webp"
							className="w-full h-full object-cover rounded-[inherit]"
							alt="User"
							fill
						/>
						<div className="absolute bottom-0 inset-x-0 bg-white/90 p-1 text-[8px] text-center text-slate-900 font-medium backdrop-blur-sm">
							User
						</div>
					</div>
					<div className="w-12 h-12 rounded-full bg-white border border-purple-200 flex items-center justify-center text-purple-500 z-30 absolute shadow-lg shadow-purple-100">
						<Heart className="w-5 h-5" />
					</div>
					<div className="relative w-24 h-32 bg-white rounded-lg rotate-[6deg] z-10 border-2 border-purple-200 overflow-hidden shadow-xl transition-transform duration-500 group-hover:rotate-[12deg] group-hover:translate-x-[10px] ring-2 ring-purple-50">
						<Image
							src="https://images.unsplash.com/photo-1618721405821-80ebc4b63d26?q=80&w=200&auto=format&fit=crop"
							className="w-full h-full object-cover"
							alt="Celebrity"
							fill
						/>
						<div className="absolute bottom-0 inset-x-0 bg-purple-600/90 p-1 text-[8px] text-center text-white font-medium">
							Celeb Match
						</div>
					</div>
				</div>
			</SpotlightCard>
		</AnimationContainer>
	);
}
