"use client";

import { FeaturesSection } from "../_components/sections/features-section";
import { HeroSection } from "../_components/sections/hero-section";
import { TestimonialsSection } from "../_components/sections/testimonials-section";

export function LandingPage() {
	return (
		<div className="overflow-x-hidden scrollbar-hide size-full">
			<HeroSection />
			<FeaturesSection />
			<TestimonialsSection />
		</div>
	);
}
