"use client";

import AnimationContainer from "../_components/global/animation-container";
import MaxWidthWrapper from "../_components/global/max-widht-wrapper";
import { BrowserMockup } from "../_components/sections/browser-mockup";
import { FeaturesSection } from "../_components/sections/features-section";
import { HeroSection } from "../_components/sections/hero-section";
import { TestimonialsSection } from "../_components/sections/testimonials-section";

export function LandingPage() {
	return (
		<div className="overflow-x-hidden scrollbar-hide size-full">
			<HeroSection />
			{/* Browser Mockup */}
			{/* <MaxWidthWrapper>
				<AnimationContainer delay={0.3}>
					<BrowserMockup />
				</AnimationContainer>
			</MaxWidthWrapper> */}
			<FeaturesSection />
			<TestimonialsSection />
		</div>
	);
}
