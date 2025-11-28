import { MessageSquare, Upload, Users } from "lucide-react";

export interface Step {
	icon: any;
	number: number;
	title: string;
	description: string;
	details: string[];
}

export const HOW_IT_WORKS_STEPS: Step[] = [
	{
		icon: Upload,
		number: 1,
		title: "Upload Your Photo",
		description:
			"Upload a clear photo of your face and let our AI analyze your unique facial features",
		details: [
			"Upload one or multiple photos",
			"AI extracts 512D facial embeddings",
			"Advanced analysis of facial attributes",
			"Select your best photo for matching",
		],
	},
	{
		icon: Users,
		number: 2,
		title: "Discover Your Matches",
		description:
			"Browse through your lookalikes and see which celebrities you match with",
		details: [
			"View university matches with similarity scores",
			"Get daily celebrity lookalike recommendations",
			"See detailed facial comparison",
			"Filter and sort your matches",
		],
	},
	{
		icon: MessageSquare,
		number: 3,
		title: "Connect & Chat",
		description:
			"Generate AI babies with matches and unlock real-time chat to start connecting",
		details: [
			"Generate baby predictions with matches",
			"Unlock chat when both users generate",
			"Get AI-powered conversation starters",
			"Connect anonymously until mutual interest",
		],
	},
];

export const PROCESS_DESCRIPTION = {
	title: "How It Works",
	subtitle: "Get started in three simple steps",
	cta: "Start Matching Now",
};
