"use client";

import { motion } from "framer-motion";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { useRef } from "react";
import { BlurImage } from "@/components/blur-image";
import { AnimatedBeam } from "@/components/ui/animated-beam";

export interface MatchCardData {
	id: string;
	user1: {
		name: string;
		image: string;
		school?: string;
	};
	user2: {
		name: string;
		image: string;
		school?: string;
	};
	matchPercentage: number;
	timestamp: string;
	isNew?: boolean;
}

export interface AdminMatchCardProps {
	data: MatchCardData;
	index: number;
}

export const AdminMatchCard = ({ data, index }: AdminMatchCardProps) => {
	const { user1, user2, matchPercentage, timestamp, isNew } = data;

	// Refs for animated beam
	const containerRef = useRef<HTMLDivElement>(null);
	const user1Ref = useRef<HTMLDivElement>(null);
	const user2Ref = useRef<HTMLDivElement>(null);

	// Determine highlight style for high matches
	const isHighMatch = matchPercentage >= 50;
	const isVeryHighMatch = matchPercentage >= 60;

	return (
		<motion.div
			ref={containerRef}
			className={`group relative bg-card rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${
				isVeryHighMatch
					? "border-primary/30 hover:shadow-xl hover:shadow-primary/5"
					: "border-border"
			}`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
		>
			{/* Animated Beam */}
			<AnimatedBeam
				containerRef={containerRef}
				fromRef={user1Ref}
				toRef={user2Ref}
				curvature={0}
				startYOffset={-12}
				endYOffset={-12}
				pathColor="hsl(var(--muted))"
				pathOpacity={0.3}
				pathWidth={2}
				gradientStartColor={isHighMatch ? "#ec4899" : "#9ca3af"}
				gradientStopColor={isHighMatch ? "#8b5cf6" : "#6b7280"}
				duration={3}
				delay={index * 0.2}
			/>

			{/* Live Tag or Time */}
			<div className="absolute top-3 right-4 text-[10px] font-medium text-muted-foreground z-10">
				{isNew ? "Just Now" : timestamp}
			</div>

			{/* Connection Visualization */}
			<div className="flex items-center justify-between mt-2 mb-6 px-2 relative">
				{/* User A */}
				<div
					ref={user1Ref}
					className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
				>
					<div className="relative">
						<BlurImage
							src={user1.image}
							alt={user1.name}
							width={64}
							height={64}
							className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md"
						/>
					</div>
					<span
						className="text-sm font-medium text-foreground text-center w-full truncate"
						title={user1.name}
					>
						{user1.name}
					</span>
				</div>

				{/* Connector */}
				<div className="flex-1 flex flex-col items-center px-4 -mt-4 z-10">
					<div
						className={`text-2xl font-bold tracking-tight ${
							isHighMatch
								? "text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500"
								: "text-foreground/80"
						}`}
					>
						{matchPercentage}%
					</div>
					<div
						className={`p-1.5 rounded-full mt-2 ${
							isVeryHighMatch
								? "bg-primary/10 text-primary"
								: isHighMatch
									? "bg-pink-50 dark:bg-pink-900/20 text-pink-500"
									: "bg-muted text-muted-foreground"
						}`}
					>
						{isVeryHighMatch ? (
							<Sparkles className="w-3.5 h-3.5 fill-primary" />
						) : (
							<Heart className="w-3.5 h-3.5" />
						)}
					</div>
				</div>

				{/* User B */}
				<div
					ref={user2Ref}
					className="flex flex-col items-center gap-2 w-20 flex-shrink-0"
				>
					<div className="relative">
						<BlurImage
							src={user2.image}
							alt={user2.name}
							width={64}
							height={64}
							className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md"
						/>
					</div>
					<span
						className="text-sm font-medium text-foreground text-center w-full truncate"
						title={user2.name}
					>
						{user2.name}
					</span>
				</div>
			</div>

			{/* Footer Details */}
			<div className="space-y-3">
				<div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
					<span
						className="flex items-center gap-1 truncate max-w-[60%]"
						title={`${user1.school || "Unknown"}`}
					>
						<MapPin className="w-3 h-3 flex-shrink-0" />
						{user1.school || "Unknown"}
					</span>
				</div>
			</div>
		</motion.div>
	);
};
