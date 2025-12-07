"use client";

import React from "react";
import { toast } from "sonner";
import { RootLayout } from "@/components/layout/root-layout";
import { useMe } from "@/features/auth/api/get-me";
import { useSignOut } from "@/features/auth/api/sign-out";
import { MatchDialog } from "@/features/matching/components/match-dialog/match-dialog";
import { UploadPhoto } from "@/features/matching/components/upload-photo/upload-photo";
import { UserMatch } from "@/features/matching/components/user-match/user-match";

export function HomeContent() {
	const { data: user, isLoading, error } = useMe();
	const signOutMutation = useSignOut();

	React.useEffect(() => {
		if (error?.message === "Account suspended") {
			toast("Account has been suspended");
			if (signOutMutation.isPending) return;
			signOutMutation.mutate(undefined);
		}
	}, [error]);

	if (isLoading) {
		return (
			<RootLayout>
				<div className="min-h-screen" />
			</RootLayout>
		);
	}

	return (
		<RootLayout>
			<main className="pt-24 min-h-screen px-4 sm:px-6 lg:px-8">
				<div className="container mx-auto pb-4 sm:pb-6 lg:pb-8">
					<div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
						<div className="space-y-8 mx-0 sm:mx-4">
							<UploadPhoto />
							{user?.image && <UserMatch />}
						</div>
					</div>

					<MatchDialog />
				</div>
			</main>
		</RootLayout>
	);
}
