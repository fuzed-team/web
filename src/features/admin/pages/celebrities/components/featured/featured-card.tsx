"use client";

import { CalendarHeart } from "lucide-react";
import Image from "next/image";

import type { CelebrityApi } from "../../api/get-celebrities";
import {
	getCelebrityImageUrl,
	getTimeLeft,
} from "../../utils/celebrity-helpers";

interface FeaturedCardProps {
	celebrity: CelebrityApi | null;
	gender: "male" | "female";
	isLoading: boolean;
}

function FeaturedCardSkeleton({ gender }: { gender: "male" | "female" }) {
	return (
		<div className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm h-40 flex items-center overflow-hidden animate-pulse">
			<div className="absolute top-3 right-3 z-10">
				<span className="bg-zinc-900/5 dark:bg-white/10 text-transparent text-[10px] font-semibold px-2 py-0.5 rounded-full">
					{gender === "male" ? "Male Pick" : "Female Pick"}
				</span>
			</div>
			<div className="h-full w-32 flex-shrink-0 bg-muted rounded-lg" />
			<div className="p-5 flex flex-col justify-center h-full z-10 relative flex-1">
				<div className="h-3 w-20 bg-muted rounded mb-2" />
				<div className="h-5 w-32 bg-muted rounded mb-2" />
				<div className="h-3 w-40 bg-muted rounded" />
			</div>
		</div>
	);
}

function FeaturedCardEmpty({ gender }: { gender: "male" | "female" }) {
	const colorClass = gender === "male" ? "text-indigo-500" : "text-pink-500";

	return (
		<div className="group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm h-40 flex items-center overflow-hidden">
			<div className="absolute top-3 right-3 z-10">
				<span className="bg-zinc-900/5 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 text-gray-900 dark:text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
					{gender === "male" ? "Male Pick" : "Female Pick"}
				</span>
			</div>
			<div className="h-full w-32 flex-shrink-0 bg-muted rounded-lg flex items-center justify-center">
				<span className="text-muted-foreground text-xs">No image</span>
			</div>
			<div className="p-5 flex flex-col justify-center h-full z-10 relative">
				<div
					className={`text-[10px] ${colorClass} font-medium tracking-wide mb-1`}
				>
					NOT SELECTED
				</div>
				<h4 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
					No Celebrity
				</h4>
				<p className="text-xs text-gray-500 mt-1 line-clamp-2">
					No featured celebrity for this slot
				</p>
				<div className="flex gap-2 mt-3">
					<button
						type="button"
						className={`text-[10px] font-medium text-gray-600 hover:${colorClass} transition-colors border-b border-transparent hover:border-current`}
					>
						Select Pick
					</button>
				</div>
			</div>
		</div>
	);
}

export function FeaturedCard({
	celebrity,
	gender,
	isLoading,
}: FeaturedCardProps) {
	if (isLoading) {
		return <FeaturedCardSkeleton gender={gender} />;
	}

	if (!celebrity) {
		return <FeaturedCardEmpty gender={gender} />;
	}

	const isMale = gender === "male";
	const colorClass = isMale ? "text-indigo-500" : "text-pink-500";
	const hoverColorClass = isMale
		? "hover:text-indigo-600"
		: "hover:text-pink-600";
	const hoverBorderClass = isMale
		? "hover:border-indigo-600"
		: "hover:border-pink-600";
	const tagLabel = isMale ? "Male Pick" : "Female Pick";
	const categoryLabel = isMale ? "MOST COMPATIBLE" : "RISING STAR";

	return (
		<div className="spotlight-card group relative bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-1 shadow-sm h-40 flex items-center overflow-hidden">
			<div className="absolute top-3 right-3 z-10">
				<span className="bg-zinc-900/5 dark:bg-white/10 backdrop-blur-sm border border-black/5 dark:border-white/10 text-gray-900 dark:text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
					{tagLabel}
				</span>
			</div>
			<div className="h-full w-32 flex-shrink-0 relative">
				<Image
					src={getCelebrityImageUrl(celebrity.image_path)}
					alt={celebrity.name}
					fill
					className="object-cover rounded-lg"
				/>
			</div>
			<div className="p-5 flex flex-col justify-center h-full z-10 relative">
				<div
					className={`text-[10px] ${colorClass} font-medium tracking-wide mb-1`}
				>
					{categoryLabel}
				</div>
				<h4 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
					{celebrity.name}
				</h4>
				<p className="text-xs text-gray-500 mt-1 line-clamp-2">
					{celebrity.bio ||
						`${celebrity.category}. ${getTimeLeft(celebrity.featured_until)}`}
				</p>
				<div className="flex gap-2 mt-3">
					<button
						type="button"
						className={`text-[10px] font-medium text-gray-600 ${hoverColorClass} transition-colors border-b border-transparent ${hoverBorderClass}`}
					>
						Change Pick
					</button>
				</div>
			</div>
		</div>
	);
}
