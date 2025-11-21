/**
 * CommonalitiesDetail Component
 * Displays expanded view of commonalities with full descriptions
 * @module commonalities-detail
 */

import { Users, Smile, Sparkles, Palette, Target } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Commonality } from "../utils/generate-match-message";
import { generateMatchMessage } from "../utils/generate-match-message";
import { cn } from "@/lib/utils";

interface CommonalitiesDetailProps {
	commonalities: Commonality[];
	className?: string;
}

/**
 * Maps commonality type to icon component
 */
const getIcon = (type: Commonality["type"]) => {
	const iconProps = { className: "w-5 h-5 text-primary" };

	switch (type) {
		case "age":
			return <Users {...iconProps} />;
		case "expression":
			return <Smile {...iconProps} />;
		case "symmetry":
			return <Sparkles {...iconProps} />;
		case "skin_tone":
			return <Palette {...iconProps} />;
		case "geometry":
			return <Target {...iconProps} />;
		default:
			return <Sparkles {...iconProps} />;
	}
};

/**
 * Gets human-readable label for commonality type
 */
const getLabel = (type: Commonality["type"], message: string): string => {
	// Use the message from the commonality if available
	if (message) {
		// Capitalize first letter
		return message.charAt(0).toUpperCase() + message.slice(1);
	}

	// Fallback labels
	switch (type) {
		case "age":
			return "Similar age";
		case "expression":
			return "Same expression";
		case "symmetry":
			return "Facial symmetry";
		case "skin_tone":
			return "Similar skin tone";
		case "geometry":
			return "Similar facial features";
		default:
			return "Common trait";
	}
};

/**
 * CommonalitiesDetail Component
 *
 * Displays an expanded view showing all commonalities with detailed descriptions.
 * Uses a card layout with icons, labels, and detail text.
 *
 * @param commonalities - Array of commonalities to display
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * <CommonalitiesDetail
 *   commonalities={connection.commonalities}
 * />
 * ```
 */
export function CommonalitiesDetail({
	commonalities,
	className,
}: CommonalitiesDetailProps) {
	if (!commonalities || commonalities.length === 0) {
		return (
			<Card className={cn("border-0 shadow-none", className)}>
				<CardHeader className="p-4 pb-3">
					<CardTitle className="text-base">What You Have in Common</CardTitle>
					<CardDescription className="text-sm">
						It's a match! Start a conversation to learn more about each other.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	const matchMessage = generateMatchMessage(commonalities);

	return (
		<Card className={cn("border-0 shadow-none", className)}>
			<CardHeader className="p-4 pb-3">
				<CardTitle className="text-base">What You Have in Common</CardTitle>
				<CardDescription className="text-sm">{matchMessage}</CardDescription>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<div className="space-y-3">
					{commonalities.map((commonality, index) => (
						<div
							key={`${commonality.type}-${index}`}
							className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 transition-colors hover:bg-muted"
						>
							<div className="mt-0.5 shrink-0">{getIcon(commonality.type)}</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm leading-tight">
									{getLabel(commonality.type, commonality.message)}
								</p>
								{commonality.detail && (
									<p className="text-xs text-muted-foreground mt-1">
										{commonality.detail}
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
