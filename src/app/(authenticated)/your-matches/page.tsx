"use client";

import { useState } from "react";
import { MatchesGrid } from "@/app/mockup/components/matches-grid";
import { CelebrityOfTheDayCard } from "@/features/matching/components/celebrity-of-the-day/celebrity-of-the-day-card";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { PhotoSelector } from "@/features/matching/components/user-match/photo-selector";

export default function YourMatchesPage() {
	const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

	return (
		<section className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-10">
			<PhotoSelector
				activePhotoId={activePhotoId}
				onPhotoSelect={setActivePhotoId}
			/>
			<CelebrityOfTheDayCard faceId={activePhotoId} />
			<MatchesGrid activePhotoId={activePhotoId} />
			<MatchDialog />
		</section>
	);
}
