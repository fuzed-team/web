"use client";

import { Lock, Sparkles, Wand2 } from "lucide-react";
import Image from "next/image";
import { SpotlightCard } from "@/components/spotlight-card";
import AnimationContainer from "../global/animation-container";

export function FutureGeneratorCard() {
	return (
		<AnimationContainer className="h-full grid" delay={0.5}>
			<SpotlightCard
				className="md:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] shadow-2xl flex flex-col md:flex-row items-center p-8 min-h-[360px] w-full border border-slate-900/5 isolate group gap-8 md:gap-12 animate-on-scroll [animation:animationIn_0.8s_ease-out_0.5s_both]"
				spotlightColor="rgba(99, 102, 241, 0.3)"
			>
				{/* Kept dark for contrast/emphasis as requested by user to mix backgrounds */}
				<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent opacity-50" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none" />

				<div className="flex flex-col items-start text-left max-w-sm shrink-0 relative z-10 order-2 md:order-1">
					<div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-6 shadow-inner">
						<Sparkles className="w-6 h-6" />
					</div>
					<div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-indigo-400/30 bg-indigo-900/50 text-indigo-200 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md mb-3">
						<Wand2 className="w-2.5 h-2.5" />
						AI Prediction
					</div>
					<h3 className="text-2xl font-semibold text-white tracking-tight mb-3">
						Future Generator
					</h3>
					<p className="text-indigo-200/80 text-sm leading-relaxed font-normal">
						Curious what a mix of you and your partner looks like? Our AI
						analyzes facial features to generate a hyper-realistic preview of
						your children in seconds.
					</p>
				</div>

				<div className="relative w-full max-w-[400px] flex-1 flex flex-col z-10 md:ml-auto order-1 md:order-2 h-full justify-center min-h-[260px]">
					<svg
						className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
						viewBox="0 0 400 240"
						preserveAspectRatio="xMidYMid meet"
						style={{ overflow: "visible" }}
					>
						<defs>
							<linearGradient
								id="beam-grad-left"
								x1="0%"
								y1="0%"
								x2="0%"
								y2="100%"
							>
								<stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
								<stop offset="50%" stopColor="#3b82f6" />
								<stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
							</linearGradient>
							<linearGradient
								id="beam-grad-right"
								x1="0%"
								y1="0%"
								x2="0%"
								y2="100%"
							>
								<stop offset="0%" stopColor="#f472b6" stopOpacity="0" />
								<stop offset="50%" stopColor="#ec4899" />
								<stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
							</linearGradient>
						</defs>
						<path
							d="M 70 65 C 70 130, 200 100, 200 155"
							fill="none"
							stroke="#4f46e5"
							strokeOpacity="0.3"
							strokeWidth="2"
							strokeDasharray="4 4"
							strokeLinecap="round"
						/>
						<path
							d="M 70 65 C 70 130, 200 100, 200 155"
							fill="none"
							stroke="url(#beam-grad-left)"
							strokeWidth="2"
							strokeDasharray="60 300"
							strokeLinecap="round"
							className="animate-beam-aura"
						/>
						<path
							d="M 330 65 C 330 130, 200 100, 200 155"
							fill="none"
							stroke="#4f46e5"
							strokeOpacity="0.3"
							strokeWidth="2"
							strokeDasharray="4 4"
							strokeLinecap="round"
						/>
						<path
							d="M 330 65 C 330 130, 200 100, 200 155"
							fill="none"
							stroke="url(#beam-grad-right)"
							strokeWidth="2"
							strokeDasharray="60 300"
							strokeLinecap="round"
							className="animate-beam-reverse-aura"
						/>
					</svg>
					<div className="flex justify-between px-8 sm:px-12 relative z-10 mb-8 mt-4">
						<div className="flex flex-col items-center gap-2 group/avatar cursor-pointer">
							<div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] transition-transform duration-300 group-hover/avatar:scale-105">
								<div className="w-full h-full rounded-full overflow-hidden border-2 border-[#1E1B4B] bg-slate-800 relative">
									<Image
										src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop"
										alt="Nam"
										fill
										className="object-cover"
									/>
								</div>
							</div>
							<span className="text-indigo-200 text-[10px] font-bold tracking-wide uppercase">
								Nam
							</span>
						</div>
						<div className="flex flex-col items-center gap-2 group/avatar cursor-pointer">
							<div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-b from-pink-500 to-purple-600 shadow-[0_0_20px_-5px_rgba(236,72,153,0.5)] transition-transform duration-300 group-hover/avatar:scale-105">
								<div className="w-full h-full rounded-full overflow-hidden border-2 border-[#1E1B4B] bg-slate-800 relative">
									<Image
										src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c543a9e1-f226-4ced-80b0-feb8445a75b9_1600w.jpg"
										alt="Jackie"
										fill
										className="object-cover"
									/>
								</div>
							</div>
							<span className="text-indigo-200 text-[10px] font-bold tracking-wide uppercase">
								Jackie
							</span>
						</div>
					</div>
					<div className="flex justify-center relative z-10 mt-auto pb-4">
						<div className="relative group/lock cursor-pointer">
							<div className="absolute -inset-3 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover/lock:opacity-60 transition-opacity duration-500" />
							<div className="w-24 h-24 rounded-2xl bg-[#0f1420]/80 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center gap-1.5 shadow-2xl relative overflow-hidden transition-all duration-300 group-hover/lock:border-indigo-500/40 group-hover/lock:-translate-y-1">
								<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover/lock:opacity-100 transition-opacity" />
								<Lock className="w-[22px] h-[22px] text-slate-400 group-hover/lock:text-indigo-400 transition-colors" />
								<span className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase group-hover/lock:text-indigo-300 transition-colors pl-0.5">
									Hidden
								</span>
								<div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
							</div>
						</div>
					</div>
				</div>
			</SpotlightCard>
		</AnimationContainer>
	);
}
