"use client";

import { RootLayout } from "@/components/layout/root-layout";
import { useMe } from "@/features/auth/api/get-me";
import { LiveMatch } from "@/features/matching/components/live-match/live-match";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { MatchNavMobile } from "@/features/matching/components/match-nav-mobile";
import { UploadPhoto } from "@/features/matching/components/upload-photo/upload-photo";
import { UserMatch } from "@/features/matching/components/user-match/user-match";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import MinimalHero from "./mini-hero";
import StudentLanding from "./student-landing";

export function HomeContent() {
	const isMobile = useIsMobile();
	const { data: user, isLoading } = useMe();

	if (isLoading) {
		return (
			<RootLayout>
				<div className="min-h-screen" />
			</RootLayout>
		);
	}

	if (!user) {
		return (
			// <RootLayout>
			// 	<StudentLanding />
			// </RootLayout>
			<StudentLanding />
		);
	}

	return (
		<RootLayout>
			<main className="pt-24 min-h-screen bg-gradient-subtle px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto pb-4 sm:pb-6 lg:pb-8">
					{/* Two Column Layout */}
					<div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
						<div className="space-y-8 mx-0 sm:mx-4">
							<UploadPhoto />
							{user?.image && <UserMatch />}
						</div>

						{/* <LiveMatch /> */}
					</div>

					<MatchDialog />
				</div>
				{/* <MatchNavMobile /> */}
			</main>
		</RootLayout>
	);
}
