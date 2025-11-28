import { ArrowRightIcon, Brain, Heart, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimationContainer from "../_components/global/animation-container";
import MaxWidthWrapper from "../_components/global/max-widht-wrapper";
import { HowItWorksStep } from "../_components/how-it-works-step";
import MagicBadge from "../_components/ui/magic-badge";
import { FEATURE_HIGHLIGHTS } from "../_utils/constants/features";
import { HOW_IT_WORKS_STEPS } from "../_utils/constants/how-it-works";

export const metadata: Metadata = {
	title: "How It Works | AI Face Matching",
	description:
		"Learn how our AI-powered face matching technology works to help you find your doppelgängers and connect with lookalikes.",
};

export default function HowItWorksPage() {
	return (
		<div className="overflow-x-hidden scrollbar-hide size-full">
			{/* Hero Section */}
			<MaxWidthWrapper>
				<div className="flex flex-col items-center justify-center w-full text-center py-20">
					<AnimationContainer>
						<MagicBadge title="How It Works" />
						<h1 className="text-center text-4xl md:text-6xl lg:text-7xl !leading-[1.15] font-medium font-heading text-foreground mt-6 max-w-4xl">
							Discover Your Face Match in{" "}
							<span className="text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text">
								Three Simple Steps
							</span>
						</h1>
						<p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
							Our advanced AI technology analyzes your facial features to find
							your perfect matches. Here's how it works under the hood.
						</p>
					</AnimationContainer>
				</div>
			</MaxWidthWrapper>

			{/* Steps Section */}
			<MaxWidthWrapper className="py-10">
				<div className="flex flex-col gap-16 py-12 max-w-4xl mx-auto">
					{HOW_IT_WORKS_STEPS.map((step, idx) => (
						<HowItWorksStep key={idx} {...step} index={idx} />
					))}
				</div>
			</MaxWidthWrapper>

			{/* Technology Section */}
			<MaxWidthWrapper className="py-20">
				<AnimationContainer>
					<div className="flex flex-col items-center justify-center w-full py-8 max-w-xl mx-auto text-center">
						<MagicBadge title="Technology" />
						<h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
							Powered by Advanced AI
						</h2>
						<p className="mt-4 text-lg text-muted-foreground max-w-lg">
							We use state-of-the-art artificial intelligence to provide
							accurate and secure face matching
						</p>
					</div>
				</AnimationContainer>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
					<AnimationContainer delay={0.1}>
						<div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
							<Brain className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-2xl font-semibold mb-3">InsightFace AI</h3>
							<p className="text-muted-foreground mb-4">
								{FEATURE_HIGHLIGHTS.accuracy}
							</p>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>
										Deep learning neural networks trained on millions of faces
									</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Real-time facial landmark detection and analysis</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Age, gender, expression, and pose estimation</span>
								</li>
							</ul>
						</div>
					</AnimationContainer>

					<AnimationContainer delay={0.2}>
						<div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
							<Zap className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-2xl font-semibold mb-3">
								FAL.AI Baby Generation
							</h3>
							<p className="text-muted-foreground mb-4">
								{FEATURE_HIGHLIGHTS.technology}
							</p>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Advanced image synthesis using FLUX models</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Realistic facial feature blending and prediction</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>High-quality image generation in seconds</span>
								</li>
							</ul>
						</div>
					</AnimationContainer>

					<AnimationContainer delay={0.3}>
						<div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
							<Shield className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-2xl font-semibold mb-3">
								Privacy & Security
							</h3>
							<p className="text-muted-foreground mb-4">
								{FEATURE_HIGHLIGHTS.privacy}
							</p>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>End-to-end encryption for all data</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Secure storage with Supabase infrastructure</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>You control your data - delete anytime</span>
								</li>
							</ul>
						</div>
					</AnimationContainer>

					<AnimationContainer delay={0.4}>
						<div className="p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
							<Heart className="w-12 h-12 text-primary mb-4" />
							<h3 className="text-2xl font-semibold mb-3">
								Real-time Matching
							</h3>
							<p className="text-muted-foreground mb-4">
								{FEATURE_HIGHLIGHTS.instant}
							</p>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>
										Instant similarity calculations using vector search
									</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Live chat with Supabase Realtime</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>Immediate notifications for new matches</span>
								</li>
							</ul>
						</div>
					</AnimationContainer>
				</div>
			</MaxWidthWrapper>

			{/* Matching Algorithm Explained */}
			<MaxWidthWrapper className="py-20">
				<AnimationContainer>
					<div className="flex flex-col items-center justify-center w-full py-8 max-w-3xl mx-auto text-center">
						<MagicBadge title="The Algorithm" />
						<h2 className="text-center text-3xl md:text-5xl !leading-[1.1] font-medium font-heading text-foreground mt-6">
							How Matching Works
						</h2>
						<p className="mt-4 text-lg text-muted-foreground">
							Understanding the science behind finding your doppelgänger
						</p>
					</div>
				</AnimationContainer>

				<div className="max-w-4xl mx-auto mt-12 space-y-8">
					<AnimationContainer delay={0.1}>
						<div className="p-6 rounded-xl border border-border bg-card/50">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									1
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">
										Face Detection & Extraction
									</h3>
									<p className="text-muted-foreground">
										When you upload a photo, our AI first detects your face in
										the image and extracts the facial region. It identifies key
										landmarks like eyes, nose, mouth, and jawline with
										pixel-perfect precision.
									</p>
								</div>
							</div>
						</div>
					</AnimationContainer>

					<AnimationContainer delay={0.2}>
						<div className="p-6 rounded-xl border border-border bg-card/50">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									2
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">
										Feature Embedding Generation
									</h3>
									<p className="text-muted-foreground">
										Your facial features are converted into a 512-dimensional
										vector (embedding) using deep learning. This mathematical
										representation captures unique aspects of your face like
										facial structure, proportions, and distinctive features in a
										way that enables accurate comparison.
									</p>
								</div>
							</div>
						</div>
					</AnimationContainer>

					<AnimationContainer delay={0.3}>
						<div className="p-6 rounded-xl border border-border bg-card/50">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									3
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">
										Similarity Calculation
									</h3>
									<p className="text-muted-foreground">
										We compare your embedding with others using cosine
										similarity, which measures the angle between vectors. A
										score closer to 1 means very similar faces, while closer to
										0 means less similar. The algorithm also factors in photo
										quality, facial attributes, and pose alignment for more
										accurate results.
									</p>
								</div>
							</div>
						</div>
					</AnimationContainer>

					<AnimationContainer delay={0.4}>
						<div className="p-6 rounded-xl border border-border bg-card/50">
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
									4
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">
										Match Ranking & Filtering
									</h3>
									<p className="text-muted-foreground">
										All potential matches are ranked by similarity score. We
										apply filters based on your preferences (like
										school/university) and quality thresholds to ensure you only
										see meaningful matches. The top matches are then displayed
										in your feed with their similarity percentages.
									</p>
								</div>
							</div>
						</div>
					</AnimationContainer>
				</div>
			</MaxWidthWrapper>

			{/* CTA Section */}
			<MaxWidthWrapper className="py-20">
				<AnimationContainer>
					<div className="rounded-2xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 p-12 text-center border border-primary/20">
						<h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">
							Ready to Find Your Match?
						</h2>
						<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
							Join thousands of users discovering their doppelgängers with our
							AI-powered face matching technology
						</p>
						<div className="flex flex-wrap items-center justify-center gap-4">
							<Button asChild size="lg">
								<Link href={"/your-matches"}>
									Get Started Now
									<ArrowRightIcon className="w-4 h-4 ml-2" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/">Back to Home</Link>
							</Button>
						</div>
					</div>
				</AnimationContainer>
			</MaxWidthWrapper>
		</div>
	);
}
