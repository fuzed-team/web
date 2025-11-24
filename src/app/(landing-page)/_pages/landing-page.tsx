"use client";

import { ArrowRightIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "../_components/feature-card";
import AnimationContainer from "../_components/global/animation-container";
import MaxWidthWrapper from "../_components/global/max-widht-wrapper";
import { BorderBeam } from "../_components/ui/border-beam";
import MagicBadge from "../_components/ui/magic-badge";
import { FEATURES } from "../_utils/constants/features";

export function LandingPage() {
	return (
		<div className="overflow-x-hidden scrollbar-hide size-full pt-10">
			{/* Hero Section */}
			<MaxWidthWrapper>
				<div className="flex flex-col items-center justify-center w-full text-center bg-gradient-to-t from-background rounded-b-xl sm:bg-none">
					<AnimationContainer className="flex flex-col items-center justify-center w-full text-center">
						{/** biome-ignore lint/a11y/useButtonType: false positive */}
						<button className="group relative grid overflow-hidden rounded-full px-4 py-1 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-colors duration-200">
							<span>
								<span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
							</span>
							<span className="backdrop absolute inset-[1px] rounded-full bg-neutral-950 transition-colors duration-200 group-hover:bg-neutral-900" />
							<span className="h-full w-full blur-md absolute bottom-0 inset-x-0 bg-gradient-to-tr from-primary/20"></span>
							<span className="z-10 py-0.5 text-sm text-neutral-100 flex items-center justify-center gap-1">
								<Sparkles className="w-3 h-3" />
								AI-Powered Face Matching
								<ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
							</span>
						</button>
						<h1 className="text-foreground text-center py-6 text-5xl font-medium tracking-normal text-balance sm:text-6xl md:text-7xl lg:text-8xl !leading-[1.15] w-full font-heading">
							Find Your Face Match{" "}
							<span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text inline-bloc">
								with AI
							</span>
						</h1>
						<p className="mb-12 text-lg tracking-tight text-muted-foreground md:text-xl text-balance max-w-2xl">
							Find your perfect match, match with celebrities, and connect with
							lookalikes
							<br className="hidden md:block" />
							<span className="hidden md:block">
								using advanced AI face recognition technology.
							</span>
						</p>
						<div className="flex items-center justify-center whitespace-nowrap gap-4 z-50">
							<Button asChild size="lg">
								<Link href={"/your-matches"} className="flex items-center">
									Get Started
									<ArrowRightIcon className="w-4 h-4 ml-2" />
								</Link>
							</Button>
							{/* <Button asChild variant="outline" size="lg">
								<Link href={"/how-it-works"}>
									Learn More
								</Link>
							</Button> */}
						</div>
					</AnimationContainer>

					{/* Hero Image/Demo */}
					<AnimationContainer
						delay={0.2}
						className="relative mt-20 p-2 md:py-32 bg-transparent w-full sm:hidden"
					>
						<div className="absolute md:top-[10%] left-1/2 gradient w-3/4 -translate-x-1/2 h-1/4 md:h-1/3 inset-0 blur-[5rem] animate-image-glow"></div>
						<div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 lg:-m-4 lg:rounded-2xl bg-opacity-50">
							<BorderBeam size={250} duration={12} delay={9} />
							{/* Placeholder for app screenshot - replace with actual image */}
							<div className="rounded-md lg:rounded-xl bg-background ring-1 ring-border overflow-hidden">
								<Image
									src="/images/mock-up.png"
									alt="App Screenshot"
									width={1200}
									height={800}
									className="w-full h-auto"
									unoptimized={true}
								/>
							</div>
							<div className="absolute bottom-0 md:-bottom-8 inset-x-0 w-full h-1/4 bg-gradient-to-t from-background z-50 rounded-b-xl"></div>
						</div>
					</AnimationContainer>
				</div>
			</MaxWidthWrapper>

			{/* Stats Section - Removed for simplicity */}
			{/* Features Section */}
			<MaxWidthWrapper className="pt-10">
				<AnimationContainer delay={0.1}>
					<div className="flex flex-col w-full items-center lg:items-center justify-center py-8">
						<MagicBadge title="Features" />
						<h2 className="text-center lg:text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
							Powerful AI-Driven Features
						</h2>
						<p className="mt-4 text-center lg:text-center text-lg text-muted-foreground max-w-2xl">
							Experience the next generation of social connection with our
							cutting-edge face matching technology
						</p>
					</div>
				</AnimationContainer>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
					{FEATURES.map((feature, idx) => (
						<FeatureCard key={idx} {...feature} index={idx} />
					))}
				</div>
			</MaxWidthWrapper>
			{/* How It Works Section - Removed for simplicity */}
			{/* Trust/Security Section - Removed for simplicity */}
			{/* Reviews Section - Removed for simplicity */}
			{/* FAQ Section - Removed for simplicity */}
			{/* CTA Section - Removed for simplicity */}
		</div>
	);
}
