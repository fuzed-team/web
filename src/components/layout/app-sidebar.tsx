"use client";

import { LogOut, Settings } from "lucide-react";
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
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 from-primary to-purple-700 text-primary-foreground">
						F
					</div>
					<h1 className="text-xl font-semibold tracking-tight text-sidebar-foreground">
						Fuzed
					</h1>
				</div>

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
