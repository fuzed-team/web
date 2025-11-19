"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CelebrityOfTheDayCard } from "@/features/matching/components/celebrity-of-the-day/celebrity-of-the-day-card";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { UploadPhoto } from "@/features/matching/components/upload-photo/upload-photo";
import { PhotoFilter } from "@/features/matching/components/user-match/photo-filter";
import { UniversityMatchTab } from "@/features/matching/components/user-match/university-match/university-match-tab";

export default function YourMatchesPage() {
	const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

	return (
		<section className="pt-24 min-h-screen bg-gradient-subtle px-4 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
				<UploadPhoto />

				{/* Photo Filter */}
				<PhotoFilter
					activePhotoId={activePhotoId}
					onPhotoSelect={setActivePhotoId}
					className="mb-2"
				/>

				{/* Celebrity of the Day - Always at top */}
				<CelebrityOfTheDayCard faceId={activePhotoId} />

				{/* User's regular matches */}
				<Tabs value="university" className="w-full">
					<TabsContent value="university">
						<UniversityMatchTab activePhotoId={activePhotoId} />
					</TabsContent>
				</Tabs>

				<MatchDialog />
			</div>
			{/* <MatchNavMobile /> */}
		</section>
	);
}
