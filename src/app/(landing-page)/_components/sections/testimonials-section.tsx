"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import AnimationContainer from "../global/animation-container";
import MaxWidthWrapper from "../global/max-widht-wrapper";

const testimonials = [
	{
		quote:
			"I appreciate that it's a web platform. I can keep it open in a tab while I'm studying. The compatibility score is weirdly accurate.",
		name: "Amanda L.",
		school: "UCLA '24",
		image:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
	},
	{
		quote:
			"The Future Generator is the ultimate icebreaker at parties. We projected the website on the TV and everyone tried it.",
		name: "Marcus J.",
		school: "UT Austin '25",
		image:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
	},
];

export function TestimonialsSection() {
	return (
		<section
			className="overflow-hidden bg-slate-50 border-slate-200 border-t pt-20 pb-20"
			id="stories"
		>
			<MaxWidthWrapper>
				<AnimationContainer delay={0.2}>
					<h2 className="text-2xl md:text-3xl font-semibold text-slate-900 text-center mb-12">
						User Stories
					</h2>
				</AnimationContainer>

				<div className="flex flex-wrap md:flex-nowrap justify-center gap-6">
					{testimonials.map((testimonial, index) => (
						<AnimationContainer
							key={testimonial.name}
							delay={0.4 + index * 0.1}
						>
							<TestimonialCard {...testimonial} />
						</AnimationContainer>
					))}
				</div>
			</MaxWidthWrapper>
		</section>
	);
}

function TestimonialCard({
	quote,
	name,
	school,
	image,
}: {
	quote: string;
	name: string;
	school: string;
	image: string;
}) {
	return (
		<div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
			<div className="flex text-amber-400 mb-4 gap-0.5">
				{[...Array(5)].map((_, i) => (
					<Star key={i} className="w-3.5 h-3.5 fill-current" />
				))}
			</div>
			<p className="text-slate-600 text-sm leading-relaxed mb-6">
				&ldquo;{quote}&rdquo;
			</p>
			<div className="flex items-center gap-3">
				<div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
					<Image
						src={image}
						alt={name}
						width={32}
						height={32}
						className="w-full h-full object-cover"
					/>
				</div>
				<div>
					<div className="text-sm font-semibold text-slate-900">{name}</div>
					<div className="text-xs text-slate-500">{school}</div>
				</div>
			</div>
		</div>
	);
}
