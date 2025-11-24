"use client";

import { Users } from "lucide-react";
import Female1 from "@/assets/mock-data/female-1.png";
import Female2 from "@/assets/mock-data/female-2.png";
import Male1 from "@/assets/mock-data/male-1.png";
import Male2 from "@/assets/mock-data/male-2.png";
import Male3 from "@/assets/mock-data/male-3.png";
import { Card } from "@/components/ui/card";
import { useUser } from "@/features/auth/api/get-me";
import { useUserMatch } from "@/features/matching/api/get-user-match";
import { useMatchId } from "@/features/matching/store/user-matches";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UniversityMatchCard } from "./university-match-card";
import { UniversityMatchSkeleton } from "./university-match-skeleton";

export interface UniversityMatch {
	id: string;
	me: {
		name: string;
		image: string | any;
		age: number;
		school: string;
	};
	other: {
		name: string;
		image: string | any;
		age: number;
		school: string;
	};
	matchPercentage: number;
	numberOfMatches: number;
	timestamp: string;
	isNew: boolean;
	isFavorited?: boolean;
	matches: Array<{
		id: string;
		createdAt: string;
		name: string;
		image: string;
		school: string;
		reactions: Record<string, number>;
		matchPercentage: number;
		isNew?: boolean;
	}>;
}

interface UniversityMatchTabProps {
	activePhotoId?: string | null;
}

export const UniversityMatchTab = ({
	activePhotoId,
}: UniversityMatchTabProps) => {
	// MOCK HOOKS FOR SCREENSHOT
	const isMobile = false; // useIsMobile();
	const matchId = null; // useMatchId();
	const user = { school: "University of Arts" }; // useUser();
	const isLoading = false;
	// const { data: userMatches, isLoading } = useUserMatch({
	// 	input: {
	// 		faceId: activePhotoId!,
	// 		limit: 50,
	// 		skip: 0,
	// 	},
	// 	queryConfig: {
	// 		enabled: !!activePhotoId,
	// 	},
	// });

	// MOCK DATA FOR SCREENSHOT
	const MOCK_MATCHES: UniversityMatch[] = [
		{
			id: "match-1",
			me: {
				name: "Me",
				image: Female1,
				age: 20,
				school: "University of Arts",
			},
			other: {
				name: "John",
				image: Male1,
				age: 21,
				school: "University of Arts",
			},
			matchPercentage: 68,
			numberOfMatches: 1,
			timestamp: "2 hours ago",
			isNew: true,
			matches: [],
		},
		{
			id: "match-2",
			me: {
				name: "Me",
				image: Female1,
				age: 20,
				school: "University of Arts",
			},
			other: {
				name: "Mike",
				image: Male3,
				age: 22,
				school: "University of Arts",
			},
			matchPercentage: 70,
			numberOfMatches: 1,
			timestamp: "5 hours ago",
			isNew: false,
			matches: [],
		},
		{
			id: "match-3",
			me: {
				name: "Me",
				image: Female1,
				age: 20,
				school: "University of Arts",
			},
			other: {
				name: "David",
				image: Male2,
				age: 20,
				school: "University of Arts",
			},
			matchPercentage: 60,
			numberOfMatches: 1,
			timestamp: "1 day ago",
			isNew: false,
			matches: [],
		},
		{
			id: "match-4",
			me: {
				name: "Me",
				image: Female1,
				age: 20,
				school: "University of Arts",
			},
			other: {
				name: "Chris",
				image: Male1,
				age: 23,
				school: "University of Arts",
			},
			matchPercentage: 62,
			numberOfMatches: 1,
			timestamp: "2 days ago",
			isNew: false,
			matches: [],
		},
	];

	const universityMatch: UniversityMatch[] = MOCK_MATCHES;
	// userMatches && userMatches.length > 0 ? userMatches : [];

	const schoolName = user?.school || "University";

	return (
		<div className="w-full max-w-4xl mx-auto">
			<Card
				className={cn(
					"p-0 sm:p-6 border-0 shadow-none sm:shadow-soft bg-transparent gap-8",
					isMobile && "bg-transparent",
				)}
			>
				{/* Header Section */}
				<div className="text-center">
					<div className="size-12 sm:size-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
						<Users className="w-6 sm:w-8 text-white" />
					</div>
					<h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
						Your Potential Matches
					</h2>
					<p className="text-sm text-gray-600 font-medium">{schoolName}</p>
				</div>

				{/* Matches List */}
				<div className="space-y-4 mb-8">
					{isLoading ? (
						Array.from({ length: 3 }).map((_, index) => (
							<UniversityMatchSkeleton key={index} />
						))
					) : universityMatch.length > 0 ? (
						universityMatch.map((match) => {
							const isSelected = matchId === match.id;

							return (
								<UniversityMatchCard
									key={match.id}
									match={match}
									isSelected={isSelected}
								/>
							);
						})
					) : (
						<div className="text-center py-12">
							<h3 className="text-xl font-semibold text-gray-600 mb-2">
								No Matches Found
							</h3>
							<p className="text-gray-500">
								We're still processing matches for you. Check back soon!
							</p>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
};
