"use client";

import type React from "react";
import { LayoutProvider } from "@/features/admin/context/layout-provider";
import { useMatchRealtime } from "@/features/matching/hooks/use-live-match-realtime";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { useNotificationsRealtime } from "@/features/notifications/hooks/use-notifications-realtime";
import { usePresenceTracker } from "@/features/presence/hooks/use-presence-tracker";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { NavigationProgress } from "../navigation-progress";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Header } from "./header";

function RootLayoutContent({ children }: { children: React.ReactNode }) {
	const isMobile = useIsMobile();
	// Enable Supabase realtime for ALL new matches at app level
	// This keeps the connection alive even when user uploads photos
	useMatchRealtime();
	usePresenceTracker();
	useNotificationsRealtime();

	return (
		<>
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
					{isMobile && <div className="h-16" />}
					{!isMobile && (
						<header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-2 bg-background/95 max-w-7xl mx-auto w-full px-6 md:px-10 backdrop-blur supports-[backdrop-filter]:bg-background/60">
							<NotificationCenter />
						</header>
					)}
					{children}
				</SidebarInset>
			</SidebarProvider>
			{isMobile && <Header />}
		</>
	);
}

export function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<LayoutProvider>
			<RootLayoutContent>{children}</RootLayoutContent>
		</LayoutProvider>
	);
}
