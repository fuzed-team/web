"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CelebrityOfTheDayCard } from "../celebrity-of-the-day/celebrity-of-the-day-card";
import { PhotoFilter } from "./photo-filter";
import { UniversityMatchTab } from "./university-match/university-match-tab";

export function UserMatch() {
	const [activeTab, setActiveTab] = useState("university");
	const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

	return (
		<div className="animate-fade-in space-y-6">
			<PhotoFilter
				activePhotoId={activePhotoId}
				onPhotoSelect={setActivePhotoId}
			/>

			<CelebrityOfTheDayCard faceId={activePhotoId} />

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				{/* Tab removed - school name now displayed in header */}
				{/* <TabsList className="grid w-full grid-cols-1 mb-8 bg-card border border-border h-[38px]">
					<TabsTrigger value="university" className="font-medium">
						{schoolName}
					</TabsTrigger>
				</TabsList> */}

				<TabsContent value="university">
					<UniversityMatchTab activePhotoId={activePhotoId} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
