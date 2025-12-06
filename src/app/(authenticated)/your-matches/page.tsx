"use client";

import { useEffect, useState } from "react";
import { ScrollToTop } from "@/components/scroll-to-top";
import type { SortByOption } from "@/features/matching/api/get-user-match";
import { useUserPhotos } from "@/features/matching/api/get-user-photos";
import { CelebrityOfTheDayCard } from "@/features/matching/components/celebrity-of-the-day/celebrity-of-the-day-card";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { MatchesGrid } from "@/features/matching/components/your-match/matches-grid";
import { PhotoSelector } from "@/features/matching/components/your-match/photo-selector";

export default function YourMatchesPage() {
	const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<SortByOption>("newest");

	const { data: userPhotosData, isLoading: isLoadingPhotos } = useUserPhotos();
	const photos = userPhotosData?.faces ?? [];

	// Automatically select the first photo when data loads
	useEffect(() => {
		if (photos.length > 0 && !activePhotoId) {
			setActivePhotoId(photos[0].id);
		}
	}, [photos, activePhotoId]);

	// Show skeletons if we are loading photos, OR if photos are loaded but not yet selected (and we have photos)
	const isGlobalLoading =
		isLoadingPhotos || (photos.length > 0 && !activePhotoId);

	return (
		<section className="max-w-7xl w-full mx-auto px-6 py-8 md:px-10 md:py-10">
			<PhotoSelector
				activePhotoId={activePhotoId}
				onPhotoSelect={setActivePhotoId}
				sortBy={sortBy}
				onSortChange={setSortBy}
				userPhotos={photos}
				isLoading={isLoadingPhotos}
			/>
			<CelebrityOfTheDayCard
				faceId={activePhotoId}
				initialLoading={isGlobalLoading}
			/>
			<MatchesGrid
				activePhotoId={activePhotoId}
				sortBy={sortBy}
				initialLoading={isGlobalLoading}
			/>
			<MatchDialog />
			<ScrollToTop />
		</section>
	);
}
