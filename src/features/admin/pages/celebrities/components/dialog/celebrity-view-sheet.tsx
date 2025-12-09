"use client";

import {
	Activity,
	Calendar,
	Clock,
	Hash,
	Info,
	Sparkles,
	Tag,
	User,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import type { CelebrityApi } from "../../api/get-celebrities";
import {
	celebrityCategoryOptions,
	celebrityGenderOptions,
} from "../../constants/celebrity-options";
import {
	getCelebrityImageUrl,
	getTimeLeft,
} from "../../utils/celebrity-helpers";

interface CelebrityViewSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	celebrity: CelebrityApi | null;
}

export function CelebrityViewSheet({
	open,
	onOpenChange,
	celebrity,
}: CelebrityViewSheetProps) {
	if (!celebrity) return null;

	const categoryOption = celebrityCategoryOptions.find(
		({ value }) => value === celebrity.category,
	);
	const genderOption = celebrityGenderOptions.find(
		({ value }) => value === celebrity.gender,
	);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
				{/* Header Section with Image Background Effect */}
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10 h-64" />
					<div className="h-64 w-full relative overflow-hidden">
						<Image
							src={getCelebrityImageUrl(celebrity.image_path)}
							alt={celebrity.name}
							fill
							className="object-cover blur-sm opacity-50"
						/>
					</div>

					<div className="absolute bottom-0 left-0 right-0 p-6 z-20">
						<div className="flex items-end gap-6">
							<div className="relative size-32 rounded-xl overflow-hidden border-4 border-background shadow-xl shrink-0">
								<Image
									src={getCelebrityImageUrl(celebrity.image_path)}
									alt={celebrity.name}
									fill
									className="object-cover"
								/>
							</div>
							<div className="mb-2">
								<SheetTitle className="text-3xl font-bold">
									{celebrity.name}
								</SheetTitle>
								<div className="flex items-center gap-2 mt-1">
									<Badge variant="secondary" className="font-medium">
										{categoryOption?.label || celebrity.category}
									</Badge>
									<Badge
										variant={
											celebrity.gender === "male" ? "default" : "secondary"
										}
									>
										{genderOption?.label || celebrity.gender}
									</Badge>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="px-6 pb-6 space-y-6">
					<SheetDescription className="sr-only">
						Detailed view of {celebrity.name}
					</SheetDescription>

					{/* Featured Status Card */}
					{celebrity.is_featured && (
						<Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
							<CardHeader className="pb-2">
								<CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2 text-base">
									<Sparkles className="size-4" />
									Currently Featured
								</CardTitle>
							</CardHeader>
							<CardContent className="grid grid-cols-2 gap-4 text-sm">
								<div className="space-y-1">
									<span className="text-muted-foreground text-xs uppercase tracking-wider">
										From
									</span>
									<p className="font-medium">
										{celebrity.featured_from
											? formatDate(celebrity.featured_from, {
													period: "datetime",
												})
											: "N/A"}
									</p>
								</div>
								<div className="space-y-1">
									<span className="text-muted-foreground text-xs uppercase tracking-wider">
										Expires In
									</span>
									<p className="font-medium text-amber-700 dark:text-amber-400">
										{getTimeLeft(celebrity.featured_until)}
									</p>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Basic Information */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
								<Info className="size-4" />
								Basic Information
							</CardTitle>
						</CardHeader>
						<CardContent className="grid grid-cols-2 gap-6">
							<InfoItem
								icon={User}
								label="Age"
								value={`${celebrity.age} years`}
							/>
							<InfoItem
								icon={Activity}
								label="Expression"
								value={celebrity.expression}
								className="capitalize"
							/>
							<InfoItem
								icon={Tag}
								label="Category"
								value={categoryOption?.label}
								className="capitalize"
							/>
							<InfoItem
								icon={Hash}
								label="ID Reference"
								value={celebrity.id.slice(0, 8)}
								className="font-mono text-xs"
							/>
						</CardContent>
					</Card>

					{/* Biography */}
					{celebrity.bio && (
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
									<User className="size-4" />
									Biography
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{celebrity.bio}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Quality Metrics */}
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
								<Activity className="size-4" />
								Quality Analysis
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							<MetricItem
								label="Overall Quality"
								value={celebrity.quality_score}
								highlight
							/>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
								<MetricItem label="Symmetry" value={celebrity.symmetry_score} />
								<MetricItem label="Blur Check" value={celebrity.blur_score} />
								<MetricItem
									label="Illumination"
									value={celebrity.illumination_score}
								/>
							</div>
						</CardContent>
					</Card>

					{/* System Metadata */}
					<div className="flex items-center justify-between text-xs text-muted-foreground px-1">
						<div className="flex items-center gap-2">
							<Calendar className="size-3" />
							<span>Added {formatDate(celebrity.created_at)}</span>
						</div>
						{celebrity.analyzed_at && (
							<div className="flex items-center gap-2">
								<Clock className="size-3" />
								<span>Analyzed {formatDate(celebrity.analyzed_at)}</span>
							</div>
						)}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}

function InfoItem({
	icon: Icon,
	label,
	value,
	className,
}: {
	icon: any;
	label: string;
	value?: string | number | null;
	className?: string;
}) {
	return (
		<div className="flex items-start gap-3">
			<div className="p-2 rounded-md bg-muted/50 mt-0.5">
				<Icon className="size-3.5 text-muted-foreground" />
			</div>
			<div>
				<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
					{label}
				</p>
				<p className={cn("text-sm font-medium mt-0.5", className)}>
					{value || "N/A"}
				</p>
			</div>
		</div>
	);
}

function MetricItem({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: number | null;
	highlight?: boolean;
}) {
	const score = value ? Math.round(value * 100) : 0;
	let indicatorClass = "bg-primary";
	let textClass = "";

	if (score >= 80) {
		indicatorClass = "bg-green-500";
		textClass = "text-green-600 dark:text-green-400";
	} else if (score >= 50) {
		indicatorClass = "bg-yellow-500";
		textClass = "text-yellow-600 dark:text-yellow-400";
	} else {
		indicatorClass = "bg-red-500";
		textClass = "text-red-600 dark:text-red-400";
	}

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-end">
				<span
					className={cn(
						"text-sm",
						highlight ? "font-medium" : "text-muted-foreground",
					)}
				>
					{label}
				</span>
				<span
					className={cn(
						"font-mono text-sm font-medium",
						value ? textClass : "text-muted-foreground/50",
						highlight && "text-base font-bold",
					)}
				>
					{value !== null && value !== undefined ? `${score}%` : "N/A"}
				</span>
			</div>
			{value !== null && value !== undefined && (
				<Progress
					value={score}
					className="h-2 bg-muted/50" // Neutral background
					indicatorClassName={indicatorClass}
				/>
			)}
		</div>
	);
}
