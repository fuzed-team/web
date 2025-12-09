"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import AnimationContainer from "../global/animation-container";
import MaxWidthWrapper from "../global/max-widht-wrapper";
import { BrowserMockup } from "./browser-mockup";

export function HeroSection() {
	return (
		<section
			className="md:pt-48 md:pb-24 overflow-hidden pt-32 pb-16 relative"
			id="platform"
		>
			{/* Background Grid */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(to right, #80808008 1px, transparent 1px), linear-gradient(to bottom, #80808008 1px, transparent 1px)",
					backgroundSize: "24px 24px",
					maskImage:
						"radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
					WebkitMaskImage:
						"radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
				}}
			/>

			<MaxWidthWrapper className="relative z-10">
				<div className="flex flex-col text-center max-w-3xl mx-auto mb-16 items-center">
					{/* Pill Badge */}
					<AnimationContainer delay={0.2}>
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium uppercase tracking-wider mb-6">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
							</span>
							Web Platform Live
						</div>
					</AnimationContainer>

					{/* Headline */}
					<AnimationContainer delay={0.4}>
						<h1 className="sm:text-5xl md:text-7xl leading-[1.1] sm:leading-[1.1] text-4xl font-semibold text-slate-900 tracking-tight mb-6">
							Social connection <br className="hidden sm:block" />
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
								powered by your face.
							</span>
						</h1>
					</AnimationContainer>

					{/* Subheadline */}
					<AnimationContainer delay={0.6}>
						<p className="sm:text-lg md:text-xl leading-relaxed text-base text-slate-500 max-w-xl mx-auto mb-8 px-4">
							<span className="">
								Connect with your university cohort, match instantly with
								celebrities, and explore AI-powered future-child predictions.
							</span>
						</p>
					</AnimationContainer>

					{/* CTAs */}
					<AnimationContainer
						delay={0.8}
						className="flex flex-col sm:flex-row w-full gap-3 px-4 sm:px-0 sm:w-auto"
					>
						<Link
							href="/auth/sign-in"
							className="relative overflow-hidden w-full sm:w-auto h-12 px-8 rounded-full flex items-center justify-center gap-2 text-white font-medium text-sm transition-all duration-300 active:scale-95 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 ring-1 ring-white/20 group"
							style={{
								background:
									"radial-gradient(65.28% 65.28% at 50% 100%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%), linear-gradient(0deg, #7a5af8, #7a5af8)",
							}}
						>
							{/* Shine Effect */}
							<div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10 animate-shine" />

							{/* Floating Particles */}
							<div className="absolute inset-0 overflow-hidden pointer-events-none">
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-100 left-[10%]"
									style={{
										animation:
											"floating-points 2.35s infinite ease-in-out 0.2s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-70 left-[30%]"
									style={{
										animation: "floating-points 2.5s infinite ease-in-out 0.5s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-80 left-[25%]"
									style={{
										animation: "floating-points 2.2s infinite ease-in-out 0.1s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-60 left-[44%]"
									style={{
										animation: "floating-points 2.05s infinite ease-in-out",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-100 left-[50%]"
									style={{
										animation: "floating-points 1.9s infinite ease-in-out",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-50 left-[75%]"
									style={{
										animation: "floating-points 1.5s infinite ease-in-out 1.5s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-90 left-[88%]"
									style={{
										animation: "floating-points 2.2s infinite ease-in-out 0.2s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-80 left-[58%]"
									style={{
										animation:
											"floating-points 2.25s infinite ease-in-out 0.2s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-60 left-[98%]"
									style={{
										animation: "floating-points 2.6s infinite ease-in-out 0.1s",
									}}
								/>
								<div
									className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-100 left-[65%]"
									style={{
										animation: "floating-points 2.5s infinite ease-in-out 0.2s",
									}}
								/>
							</div>
							<span className="relative z-20 flex items-center gap-2">
								Get Started
								<ArrowUpRight className="w-4 h-4" />
							</span>
						</Link>
						<button
							type="button"
							onClick={() => {
								document.getElementById("features")?.scrollIntoView({
									behavior: "smooth",
									block: "start",
								});
							}}
							className="w-full sm:w-auto h-12 px-8 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-transform"
						>
							Explore Features
						</button>
					</AnimationContainer>
				</div>

				{/* Browser Mockup */}
				<AnimationContainer delay={1}>
					<BrowserMockup />
				</AnimationContainer>
			</MaxWidthWrapper>
		</section>
	);
}
