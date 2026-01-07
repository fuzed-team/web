"use client";

import AnimationContainer from "../../global/animation-container";
import MaxWidthWrapper from "../../global/max-widht-wrapper";
import { ButtonCTA } from "./button-cta";
import { RightSide } from "./right-side";

export function HeroSection() {
	return (
		<section
			className="md:py-24 overflow-hidden pt-24 pb-20 relative"
			id="platform"
		>
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
			<MaxWidthWrapper className="grid md:grid-cols-2 relative z-10 min-h-[80vh] items-center">
				<div className="flex flex-col items-center md:items-start max-w-3xl">
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
						<h1 className="sm:text-5xl md:text-7xl leading-[1.1] sm:leading-[1.1] text-4xl font-semibold text-slate-900 tracking-tight mb-6 text-center md:text-left">
							Find your{" "}
							<span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600">
								soulmate
							</span>
							<br />
							on campus.
						</h1>
					</AnimationContainer>

					{/* Subheadline */}
					<AnimationContainer delay={0.6}>
						<p className="sm:text-lg md:text-xl leading-relaxed text-base text-slate-500 text-center md:text-left max-w-xl mb-8 px-4">
							<span className="">
								Connect with classmates, match instantly, and explore AI-powered
								predictions.
							</span>
						</p>
					</AnimationContainer>

					{/* CTAs */}
					<AnimationContainer
						delay={0.8}
						className="flex flex-col sm:flex-row w-full gap-3 px-4 sm:px-0 sm:w-auto"
					>
						<ButtonCTA />
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

				<RightSide />
			</MaxWidthWrapper>
		</section>
	);
}
