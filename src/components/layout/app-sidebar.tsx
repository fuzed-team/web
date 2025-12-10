"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import Logo from "@/assets/logo";
import confirm from "@/components/confirm";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/features/admin/components/layout/nav-group";
import { useLayout } from "@/features/admin/context/layout-provider";
import { useUser } from "@/features/auth/api/get-me";
import { useSignOut } from "@/features/auth/api/sign-out";
import { useMessageNotificationsCount } from "@/features/notifications/api/get-message-notifications-count";
import { sidebarData } from "./data/sidebar-data";
import { UserPhoto } from "./user-photo";

const adminNavItem = {
	title: "Admin",
	url: "/admin",
	icon: Settings,
};

export function AppSidebar() {
	const user = useUser();
	const { collapsible, variant } = useLayout();
	const signOutMutation = useSignOut();
	const { data: messageNotifications } = useMessageNotificationsCount();

	const handleSignOut = () => {
		confirm({
			title: "Log out",
			description: "Are you sure you want to log out?",
			onConfirm: () => {
				signOutMutation.mutate(undefined);
			},
		});
	};

	const messageCount = messageNotifications?.unread_count || 0;

	const navGroups = sidebarData.navGroups.map((group, index) => {
		// Update items to add badge for chat
		const items = group.items.map((item) => {
			if (item.url === "/chat" && messageCount > 0) {
				return {
					...item,
					badge: messageCount > 99 ? "99+" : String(messageCount),
				};
			}
			return item;
		});

		if (index === 0 && user?.role === "admin") {
			return {
				...group,
				items: [adminNavItem, ...items],
			};
		}
		return { ...group, items };
	});

	return (
		<Sidebar collapsible={collapsible} variant={variant}>
			<SidebarHeader className="p-4">
				{/* Logo */}
				<Link href="/" className="flex items-center">
					<Logo className="size-12" />
					<div className="flex flex-col relative -ml-2">
						<span className="text-foreground text-lg font-bold">uzed</span>
						<span className="text-muted-foreground -mt-1 text-xs leading-none">
							Match. Generate. Discover.
						</span>
					</div>
				</Link>

				<UserPhoto className="mt-6" />
			</SidebarHeader>
			<SidebarContent>
				{navGroups.map((props, index) => (
					<NavGroup key={index} {...props} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							onClick={handleSignOut}
							disabled={signOutMutation.isPending}
							tooltip="Log Out"
						>
							<LogOut />
							<span>Log Out</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
