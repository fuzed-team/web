"use client";

import type React from "react";
import { ThemeSwitch } from "@/features/admin/components/theme-switch";
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
import { NavHeader } from "./nav-header";

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
						<NavHeader>
							<ThemeSwitch />
							<NotificationCenter />
						</NavHeader>
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
