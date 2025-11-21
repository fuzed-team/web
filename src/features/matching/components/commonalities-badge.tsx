/**
 * CommonalitiesBadge Component
 * Displays commonalities between matched users as compact badges with icons
 * @module commonalities-badge
 */

import { Users, Smile, Sparkles, Palette, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Commonality } from "../utils/generate-match-message";
import { cn } from "@/lib/utils";

interface CommonalitiesBadgeProps {
	commonalities: Commonality[];
	variant?: "compact" | "full";
	className?: string;
}

/**
 * Maps commonality type to icon component
 */
const getIcon = (type: Commonality["type"]) => {
	const iconProps = { className: "w-3 h-3" };

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
			return "Similar features";
		default:
			return "Common trait";
	}
};

/**
 * Renders a single commonality badge
 */
const CommonalityBadge = ({
	commonality,
	variant,
}: {
	commonality: Commonality;
	variant: "compact" | "full";
}) => {
	const icon = getIcon(commonality.type);
	const label = getLabel(commonality.type, commonality.message);

	if (variant === "compact") {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge
							variant="secondary"
							className="h-6 w-6 p-0 flex items-center justify-center"
						>
							{icon}
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						<p className="font-medium">{label}</p>
						{commonality.detail && (
							<p className="text-xs text-muted-foreground">
								{commonality.detail}
							</p>
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// Full variant
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Badge variant="outline" className="gap-1.5 px-2.5 py-1">
						{icon}
						<span className="text-xs">{label}</span>
					</Badge>
				</TooltipTrigger>
				{commonality.detail && (
					<TooltipContent>
						<p className="text-xs">{commonality.detail}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
};

/**
 * CommonalitiesBadge Component
 *
 * @param commonalities - Array of commonalities to display
 * @param variant - Display variant: "compact" (icons only) or "full" (icons + labels)
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Compact variant (icons only)
 * <CommonalitiesBadge
 *   commonalities={commonalities}
 *   variant="compact"
 * />
 *
 * // Full variant (icons + labels)
 * <CommonalitiesBadge
 *   commonalities={commonalities}
 *   variant="full"
 * />
 * ```
 */
export function CommonalitiesBadge({
	commonalities,
	variant = "compact",
	className,
}: CommonalitiesBadgeProps) {
	if (!commonalities || commonalities.length === 0) {
		return null;
	}

	return (
		<div className={cn("flex flex-wrap gap-1.5", className)}>
			{commonalities.map((commonality, index) => (
				<CommonalityBadge
					key={`${commonality.type}-${index}`}
					commonality={commonality}
					variant={variant}
				/>
			))}
		</div>
	);
}
