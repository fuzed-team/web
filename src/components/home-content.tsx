"use client";

import { toast } from "sonner";
import { RootLayout } from "@/components/layout/root-layout";
import { useMe } from "@/features/auth/api/get-me";
import { useSignOut } from "@/features/auth/api/sign-out";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { UploadPhoto } from "@/features/matching/components/upload-photo/upload-photo";
import { UserMatch } from "@/features/matching/components/user-match/user-match";

export function HomeContent() {
	const { data: user, isLoading, error } = useMe();
	console.log("user", error?.message);
	const signOutMutation = useSignOut();
	const handleLogout = () => {
		if (signOutMutation.isPending) return;
		signOutMutation.mutate(undefined);
	};

	if (isLoading) {
		return (
			<RootLayout>
				<div className="min-h-screen" />
			</RootLayout>
		);
	}

	if (error?.message === "Account suspended") {
		toast("Account has been suspended");
		return handleLogout();
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
