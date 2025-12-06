"use client";

import { useState } from "react";
import { ScrollToTop } from "@/components/scroll-to-top";
import type { SortByOption } from "@/features/matching/api/get-user-match";
import { CelebrityOfTheDayCard } from "@/features/matching/components/celebrity-of-the-day/celebrity-of-the-day-card";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { MatchesGrid } from "@/features/matching/components/your-match/matches-grid";
import { PhotoSelector } from "@/features/matching/components/your-match/photo-selector";

export default function YourMatchesPage() {
	const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<SortByOption>("newest");

	return (
		<section className="max-w-7xl w-full mx-auto px-6 py-8 md:px-10 md:py-10">
			<PhotoSelector
				activePhotoId={activePhotoId}
				onPhotoSelect={setActivePhotoId}
				sortBy={sortBy}
				onSortChange={setSortBy}
			/>
			<CelebrityOfTheDayCard faceId={activePhotoId} />
			<MatchesGrid activePhotoId={activePhotoId} sortBy={sortBy} />
			<MatchDialog />
			<ScrollToTop />
		</section>
	);
}
