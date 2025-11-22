import { Users, Brain, Baby, Shield } from "lucide-react";

export const DEFAULT_AVATAR_URL =
	"https://api.dicebear.com/8.x/initials/svg?backgroundType=gradientLinear&backgroundRotation=0,360&seed=";

export const PAGINATION_LIMIT = 10;

// App Statistics (update these with real numbers when available)
export const APP_STATS = {
	totalUsers: "10,000+",
	matchesCreated: "50,000+",
	babiesGenerated: "25,000+",
	celebrityMatches: "100+",
} as const;

// Trust/Security Highlights
export const TRUST_BADGES = [
	{
		title: "Privacy First",
		description: "Your data is encrypted and never shared without permission",
		icon: Shield,
	},
	{
		title: "Advanced AI",
		description: "Powered by InsightFace and FAL.AI technology",
		icon: Brain,
	},
	{
		title: "University Network",
		description: "Connect with people from your school community",
		icon: Users,
	},
	{
		title: "Fun & Engaging",
		description: "Unique baby generation feature to break the ice",
		icon: Baby,
	},
] as const;

// Testimonials (add real user testimonials when available)
export const REVIEWS = [
	{
		name: "Sarah Chen",
		username: "@sarahc",
		avatar: "https://randomuser.me/api/portraits/women/1.jpg",
		rating: 5,
		review:
			"I found my doppelgänger on campus! The AI matching is surprisingly accurate. The baby generator is such a fun conversation starter.",
	},
	{
		name: "Marcus Johnson",
		username: "@marcusj",
		avatar: "https://randomuser.me/api/portraits/men/1.jpg",
		rating: 5,
		review:
			"Never thought I'd find someone who looks so similar to me. The celebrity matching feature is hilarious - I got matched with a young Brad Pitt!",
	},
	{
		name: "Emily Rodriguez",
		username: "@emilyrod",
		avatar: "https://randomuser.me/api/portraits/women/2.jpg",
		rating: 4,
		review:
			"Great app for meeting new people! The face matching technology is really impressive. Chat unlocking through baby generation is creative.",
	},
	{
		name: "David Kim",
		username: "@davidkim",
		avatar: "https://randomuser.me/api/portraits/men/2.jpg",
		rating: 5,
		review:
			"This app is addictive! I love seeing my celebrity lookalikes and the similarity scores. Made some great connections through mutual matches.",
	},
	{
		name: "Jessica Taylor",
		username: "@jesstaylor",
		avatar: "https://randomuser.me/api/portraits/women/3.jpg",
		rating: 5,
		review:
			"The AI baby generator blew my mind! It's such a unique feature. Found several matches on my campus and the conversations have been amazing.",
	},
	{
		name: "Alex Martinez",
		username: "@alexm",
		avatar: "https://randomuser.me/api/portraits/men/3.jpg",
		rating: 4,
		review:
			"Really cool concept! The face matching is accurate and I appreciate the privacy-first approach. The baby feature is a genius icebreaker.",
	},
] as const;
