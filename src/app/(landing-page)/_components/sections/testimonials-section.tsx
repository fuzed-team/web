"use client";

import { BadgeCheck, Heart, Twitter } from "lucide-react";
import Image from "next/image";
import AnimationContainer from "../global/animation-container";

const testimonialsRow1 = [
	{
		name: "Amanda L.",
		handle: "@amanda_ucla",
		image: "/images/mock-images/girl-1.webp",
		content:
			"Found 3 matches in my campus within the first day! The AI matching is surprisingly accurate. Already chatting with one of them 😊",
		tag: "Campus Match",
		time: "2h ago",
		tagColor: "indigo",
		verified: true,
	},
	{
		name: "Marcus J.",
		handle: "@marcus_dev",
		image: "/images/mock-images/boy-1.webp",
		content:
			"The baby generator feature is wild! Generated a baby photo with my match and we can't stop laughing. This app is genius 😂",
		tag: "Baby Generator",
		time: "5h ago",
		tagColor: "purple",
		verified: true,
	},
	{
		name: "Sarah K.",
		handle: "@sarah_designs",
		image: "/images/mock-images/girl-2.webp",
		content:
			"Love that it's web-based, no app download needed. The face matching algorithm works really well and the UI is super clean!",
		tag: "Platform",
		time: "1d ago",
		tagColor: "emerald",
		verified: true,
	},
	{
		name: "David Chen",
		handle: "@dave_c",
		image: "/images/mock-images/boy-2.webp",
		content:
			"Got matched with someone who has 87% facial similarity. We actually look alike! The AI is pretty impressive 🤯",
		tag: "AI Matching",
		time: "3h ago",
		tagColor: "orange",
		verified: false,
	},
];

const testimonialsRow2 = [
	{
		name: "Emily Rose",
		handle: "@emrose_99",
		image: "/images/mock-images/girl-3.webp",
		content:
			"The real-time chat is smooth and the conversation starters are actually helpful. Made connecting with my matches so much easier!",
		tag: "Chat",
		time: "6h ago",
		tagColor: "pink",
		verified: true,
	},
	{
		name: "Tom H.",
		handle: "@tom_h_tech",
		image: "/images/mock-images/boy-3.webp",
		content:
			"The celebrity lookalike feature is addictive! Apparently I look 78% like young Brad Pitt. My friends are jealous 😎",
		tag: "Celebrity Match",
		time: "12h ago",
		tagColor: "blue",
		verified: false,
	},
	{
		name: "Jessica Lee",
		handle: "@jess_lee",
		image: "/images/mock-images/girl-4.webp",
		content:
			"Been using Fuzzed for a week. The UI is so clean and modern. Love the minimalist design and smooth animations! 🎨",
		tag: "Design",
		time: "1d ago",
		tagColor: "slate",
		verified: true,
	},
	{
		name: "Alex M.",
		handle: "@alex_m_photo",
		image: "/images/mock-images/boy-4.webp",
		content:
			"Daily celebrity recommendations are fun! Today I got matched with Emma Watson at 82%. Makes checking the app every day worth it!",
		tag: "Daily Match",
		time: "4h ago",
		tagColor: "yellow",
		verified: false,
	},
];

export function TestimonialsSection() {
	return (
		<section
			className="relative py-24 bg-slate-50 border-t border-slate-200 overflow-hidden"
			id="stories"
		>
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
			<div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />

			<div className="relative max-w-7xl mx-auto px-4 md:px-6 mb-16 text-center z-10">
				<AnimationContainer delay={0.2} className="inline-block">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-wider uppercase mb-4">
						<Heart className="w-3 h-3" /> Community Love
					</div>
				</AnimationContainer>

				<AnimationContainer delay={0.3}>
					<h2 className="text-3xl md:text-5xl font-semibold text-slate-900 tracking-tight mb-4">
						Joined by thousands of
						<br className="hidden sm:block" />
						<span className="text-indigo-600">happy students.</span>
					</h2>
				</AnimationContainer>

				<AnimationContainer delay={0.4}>
					<p className="text-slate-500 max-w-lg mx-auto text-lg">
						See what people are saying about their matches and predictions.
					</p>
				</AnimationContainer>
			</div>

			<div className="relative flex flex-col gap-6 marquee-group">
				{/* Left Fade Mask */}
				<div className="absolute left-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
				{/* Right Fade Mask */}
				<div className="absolute right-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />

				{/* Row 1: Left Movement */}
				<div
					className="flex min-w-full shrink-0 gap-6 animate-marquee"
					style={{ "--duration": "50s" } as React.CSSProperties}
				>
					{[...testimonialsRow1, ...testimonialsRow1].map((item, i) => (
						<TestimonialCard key={`${item.name}-${i}`} {...item} />
					))}
				</div>

				{/* Row 2: Right Movement (Reverse) */}
				<div
					className="flex min-w-full shrink-0 gap-6 animate-marquee-reverse"
					style={{ "--duration": "50s" } as React.CSSProperties}
				>
					{[...testimonialsRow2, ...testimonialsRow2].map((item, i) => (
						<TestimonialCard key={`${item.name}-${i}`} {...item} />
					))}
				</div>
			</div>
		</section>
	);
}

function TestimonialCard({
	name,
	handle,
	image,
	content,
	tag,
	time,
	tagColor,
	verified,
}: {
	name: string;
	handle: string;
	image: string;
	content: string;
	tag: string;
	time: string;
	tagColor: string;
	verified: boolean;
}) {
	const colorClasses: Record<string, string> = {
		indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
		purple: "bg-purple-50 text-purple-600 border-purple-100",
		emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
		orange: "bg-orange-50 text-orange-600 border-orange-100",
		pink: "bg-pink-50 text-pink-600 border-pink-100",
		blue: "bg-blue-50 text-blue-600 border-blue-100",
		slate: "bg-slate-100 text-slate-600 border-slate-200",
		yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
	};

	return (
		<div className="w-[300px] sm:w-[350px] shrink-0 bg-white p-5 rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-indigo-100 transition-all duration-300 group">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-3">
					<div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
						<Image src={image} alt={name} fill className="object-cover" />
					</div>
					<div>
						<div className="flex items-center gap-1">
							<span className="text-sm font-semibold text-slate-900">
								{name}
							</span>
							{verified && (
								<BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500/10" />
							)}
						</div>
						<span className="text-[10px] text-slate-400 font-medium">
							{handle}
						</span>
					</div>
				</div>
				<Twitter className="w-4 h-4 text-slate-300" />
			</div>
			<p className="text-slate-600 text-sm leading-relaxed">{content}</p>
			<div className="mt-4 flex items-center gap-2 pt-4 border-t border-slate-50">
				<span
					className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium border ${colorClasses[tagColor]}`}
				>
					{tag}
				</span>
				<span className="text-[10px] text-slate-400 ml-auto">{time}</span>
			</div>
		</div>
	);
}
