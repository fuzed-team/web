"use client";

import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import AITextLoading from "@/components/kokonutui/ai-text-loading";
import { LayoutProvider } from "@/features/admin/context/layout-provider";
import { getUserPhotosQueryOptions } from "@/features/matching/api/get-user-photos";
import { useMatchRealtime } from "@/features/matching/hooks/use-live-match-realtime";
import { usePresenceTracker } from "@/features/presence/hooks/use-presence-tracker";
import { cn } from "@/lib/utils";
import { NavigationProgress } from "../navigation-progress";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function RootLayout({ children }: { children: React.ReactNode }) {
	const queryClient = useQueryClient();
	const [isPhotosPrefetching, setIsPhotosPrefetching] = React.useState(true);

	// Enable Supabase realtime for ALL new matches at app level
	// This keeps the connection alive even when user uploads photos
	useMatchRealtime();
	usePresenceTracker();

	React.useEffect(() => {
		queryClient.prefetchQuery(getUserPhotosQueryOptions()).finally(() => {
			setIsPhotosPrefetching(false);
		});
	}, [queryClient]);

	// Show loading when either auth is loading or photos are being prefetched
	const isAppLoading = isPhotosPrefetching;

	return (
		<LayoutProvider>
			<SidebarProvider open={true}>
				<NavigationProgress />
				<AppSidebar />
				<SidebarInset
					className={cn(
						// Set content container, so we can use container queries
						"@container/content",

						// If layout is fixed, set the height
						// to 100svh to prevent overflow
						"has-data-[layout=fixed]:h-svh",

						// If layout is fixed and sidebar is inset,
						// set the height to 100svh - spacing (total margins) to prevent overflow
						"peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
					)}
				>
					{isAppLoading ? (
						<div className="min-h-screen flex items-center justify-center">
							<AITextLoading
								texts={["Matching...", "Loading...", "Please wait..."]}
							/>
						</div>
					) : (
						children
					)}
				</SidebarInset>
			</SidebarProvider>
			{/* <Header loading={isAppLoading} /> */}
		</LayoutProvider>
	);
}
