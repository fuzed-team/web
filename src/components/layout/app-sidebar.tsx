"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/features/admin/components/layout/nav-group";
import { useLayout } from "@/features/admin/context/layout-provider";
import { sidebarData } from "./data/sidebar-data";
import { UserPhoto } from "./user-photo";

export function AppSidebar() {
	const { collapsible, variant } = useLayout();

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
				{sidebarData.navGroups.map((props, index) => (
					<NavGroup key={index} {...props} />
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
