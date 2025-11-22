import { Baby, Brain, MessageCircle, Sparkles } from "lucide-react";

export interface Feature {
	icon: any;
	title: string;
	description: string;
	details: string[];
}

export const FEATURES: Feature[] = [
	{
		icon: Brain,
		title: "AI Matchmaking",
		description:
			"Advanced AI helps you find your perfect match based on compatibility and connection",
		details: [
			"Smart matchmaking technology",
			"Analyzes compatibility",
			"High-accuracy matching",
			"Finds your most suitable match",
		],
	},
	{
		icon: Sparkles,
		title: "Celebrity Lookalikes",
		description:
			"Discover which celebrities you look like the most with our AI-powered celebrity matching system",
		details: [
			"Compare with thousands of celebrities",
			"Get daily match recommendations",
			"See similarity percentages",
			"Share matches with friends",
		],
	},
	{
		icon: Baby,
		title: "AI Baby Generator",
		description:
			"See what your baby would look like with your matches using cutting-edge AI image generation",
		details: [
			"Generate realistic baby images",
			"Powered by advanced AI",
			"Save and share predictions",
			"View generation history",
		],
	},
	{
		icon: MessageCircle,
		title: "Real-time Chat",
		description:
			"Connect instantly with your matches through our secure, real-time messaging system",
		details: [
			"Unlock chat with matches",
			"Fun conversation starters",
			"Instant messaging",
			"Safe and secure connection",
		],
	},
];

export const FEATURE_HIGHLIGHTS = {
	privacy:
		"Your photos are securely stored and never shared without permission",
	technology: "Built with state-of-the-art AI technology",
	accuracy: "Advanced facial analysis for precise matching",
	instant: "Real-time matching and instant notifications",
};
