import { Brain, Sparkles, Baby, MessageCircle } from "lucide-react";

export interface Feature {
  icon: any;
  title: string;
  description: string;
  details: string[];
}

export const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "AI Face Matching",
    description: "Advanced AI analyzes your facial features to find your perfect matches based on facial similarity",
    details: [
      "512-dimensional face embeddings using InsightFace AI",
      "Advanced facial analysis: age, gender, landmarks, pose",
      "High-accuracy similarity scoring",
      "Quality-aware matching algorithms"
    ]
  },
  {
    icon: Sparkles,
    title: "Celebrity Lookalikes",
    description: "Discover which celebrities you look like the most with our AI-powered celebrity matching system",
    details: [
      "Compare your face with thousands of celebrities",
      "Get daily celebrity match recommendations",
      "See detailed similarity percentages",
      "Share your celebrity matches with friends"
    ]
  },
  {
    icon: Baby,
    title: "AI Baby Generator",
    description: "See what your baby would look like with your matches using cutting-edge AI image generation",
    details: [
      "Generate realistic baby images from two faces",
      "Powered by FAL.AI's advanced models",
      "Save and share baby predictions",
      "View baby generation history"
    ]
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Connect instantly with your matches through our secure, real-time messaging system",
    details: [
      "Unlock chat when both users generate a baby",
      "AI-generated conversation starters",
      "Real-time messaging with online status",
      "Anonymous until mutual connection"
    ]
  }
];

export const FEATURE_HIGHLIGHTS = {
  privacy: "Your photos are securely stored and never shared without permission",
  technology: "Built with state-of-the-art AI from InsightFace and FAL.AI",
  accuracy: "Advanced facial analysis with 512-dimensional feature vectors",
  instant: "Real-time matching and instant notifications"
};
