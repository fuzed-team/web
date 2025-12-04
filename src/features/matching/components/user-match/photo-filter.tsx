/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";

import { motion } from "framer-motion";
import React from "react";
import { BlurImage } from "@/components/blur-image";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useUserPhotos } from "@/features/matching/api/get-user-photos";
import { cn } from "@/lib/utils";
import { PhotoFilterSkeleton } from "./photo-filter-skeleton";

interface PhotoFilterProps {
	activePhotoId: string | null;
	onPhotoSelect: (photoId: string | null) => void;
	className?: string;
}

export const PhotoFilter = ({
	activePhotoId,
	onPhotoSelect,
	className,
}: PhotoFilterProps) => {
	const { data: userPhotosData, isLoading } = useUserPhotos();
	const uploads = userPhotosData?.faces ?? [];

	const handleTabClick = (photoId: string | null) => {
		onPhotoSelect(photoId);
	};

	React.useEffect(() => {
		if (
			userPhotosData?.faces &&
			userPhotosData.faces.length > 0 &&
			!activePhotoId
		) {
			onPhotoSelect(uploads[0].id);
		}
	}, [userPhotosData, activePhotoId, onPhotoSelect, uploads]);

	// Show skeleton while loading
	if (isLoading) {
		return <PhotoFilterSkeleton className={className} />;
	}

	return (
		<div
			className={cn(
				"flex overflow-x-auto gap-3 pb-4 snap-x-mandatory hide-scrollbar",
				className,
			)}
		>
			{/* Add New Photo Button (Integrated here for layout, but logically separate) */}
			{/* We might need to lift the UploadPhoto component up or pass it as a child if we want perfect alignment, 
                but for now, we'll assume it's rendered alongside this component in the parent. 
                Actually, the user request said "UploadPhoto AND PhotoFilter should be extract ui with photo-selector".
                So the parent page should arrange them in a flex row.
            */}

			{uploads.map((upload, index) => {
				const isActive = activePhotoId === upload.id;

				return (
					<div
						key={upload.id}
						className="flex-shrink-0 relative snap-center cursor-pointer"
						onClick={() => handleTabClick(upload.id)}
					>
						{isActive && (
							<div className="absolute -top-2 -right-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm bg-primary text-primary-foreground">
								Selected
							</div>
						)}
						<div
							className={cn(
								"w-20 h-24 md:w-24 md:h-32 rounded-xl overflow-hidden border transition-all duration-300",
								isActive
									? "p-0.5 bg-gradient-to-br from-primary shadow-lg shadow-primary/25 ring-2 ring-offset-2 ring-offset-background ring-primary/50 to-purple-600"
									: "border-border opacity-60 hover:opacity-100",
							)}
						>
							<BlurImage
								src={upload.image_url}
								alt={`Photo ${index + 1}`}
								width={100}
								height={128}
								className={cn(
									"w-full h-full object-cover",
									isActive ? "rounded-[10px]" : "",
								)}
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
};
