"use client";

import { Camera, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type QuotaItem, useUserQuota } from "../api/get-user-quota";

interface QuotaBarProps {
	icon: React.ReactNode;
	label: string;
	quota: QuotaItem;
}

function QuotaBar({ icon, label, quota }: QuotaBarProps) {
	// Handle unlimited (-1) or disabled (0) limits
	const isUnlimited = quota.limit === -1;
	const isDisabled = quota.limit === 0;

	const percentage = isUnlimited ? 0 : (quota.current / quota.limit) * 100;

	// Color based on usage
	const getProgressColor = () => {
		if (isUnlimited) return "bg-gradient-to-r from-primary to-purple-600";
		if (percentage >= 90) return "bg-red-500";
		if (percentage >= 70) return "bg-amber-500";
		return "bg-gradient-to-r from-primary to-purple-600";
	};

	if (isDisabled) {
		return (
			<div className="space-y-1">
				<div className="flex items-center justify-between text-xs">
					<span className="flex items-center gap-1.5 text-muted-foreground">
						{icon}
						{label}
					</span>
					<span className="text-muted-foreground">Disabled</span>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between text-xs">
				<span className="flex items-center gap-1.5 text-muted-foreground">
					{/* {icon} */}
					{label}
				</span>
				<span className="text-muted-foreground">
					{isUnlimited ? (
						<span className="text-primary font-medium">Unlimited</span>
					) : (
						<>
							<span
								className={cn(percentage >= 90 && "text-red-500 font-medium")}
							>
								{quota.current}
							</span>
							<span className="text-muted-foreground/60">/{quota.limit}</span>
						</>
					)}
				</span>
			</div>
			{!isUnlimited && (
				<div className="h-1.5 w-full rounded-full bg-sidebar-accent overflow-hidden">
					<div
						className={cn(
							"h-full rounded-full transition-all",
							getProgressColor(),
						)}
						style={{ width: `${Math.min(percentage, 100)}%` }}
					/>
				</div>
			)}
		</div>
	);
}

function QuotaDisplaySkeleton() {
	return (
		<div className="space-y-3 mt-4 pt-3 border-t border-sidebar-border">
			<div className="space-y-1">
				<Skeleton className="h-3 w-24 bg-primary/20" />
				<Skeleton className="h-1.5 w-full bg-primary/20" />
			</div>
			<div className="space-y-1">
				<Skeleton className="h-3 w-28 bg-primary/20" />
				<Skeleton className="h-1.5 w-full bg-primary/20" />
			</div>
		</div>
	);
}

export function QuotaDisplay({ className }: { className?: string }) {
	const { data: quota, isLoading } = useUserQuota();

	if (isLoading) {
		return <QuotaDisplaySkeleton />;
	}

	if (!quota) {
		return null;
	}

	return (
		<div
			className={cn(
				"space-y-3 mt-4 pt-3 border-t border-sidebar-border",
				className,
			)}
		>
			<QuotaBar
				icon={<Camera className="w-3 h-3" />}
				label="Photos"
				quota={quota.photo_uploads}
			/>
			<QuotaBar
				icon={<Sparkles className="w-3 h-3" />}
				label="Baby Gen"
				quota={quota.baby_generations}
			/>
		</div>
	);
}
