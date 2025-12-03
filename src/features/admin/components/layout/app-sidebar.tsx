"use client";

import { Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { useLayout } from "@/features/admin/context/layout-provider";
import { AppTitle } from "./app-title";
import { sidebarData } from "./data/sidebar-data";
import {
	NavGroup,
	SidebarMenuCollapsedDropdown,
	SidebarMenuCollapsible,
	SidebarMenuLink,
} from "./nav-group";
import type { NavItem } from "./types";

const footerItems = [
	{
		title: "Back to Home",
		url: "/",
		icon: Home,
	},
] as NavItem[];

export function AppSidebar() {
	const { collapsible, variant } = useLayout();

	const { state, isMobile } = useSidebar();
	const href = usePathname() || "";
	return (
		<Sidebar collapsible={collapsible} variant={variant}>
			<SidebarHeader>
				<AppTitle />
			</SidebarHeader>
			<SidebarContent>
				{sidebarData.navGroups.map((props) => (
					<NavGroup key={props.title} {...props} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					{footerItems.map((item) => {
						const key = `${item.title}-${item.url}`;

						if (!item.items)
							return <SidebarMenuLink key={key} item={item} href={href} />;

						if (state === "collapsed" && !isMobile)
							return (
								<SidebarMenuCollapsedDropdown
									key={key}
									item={item}
									href={href}
								/>
							);

						return <SidebarMenuCollapsible key={key} item={item} href={href} />;
					})}
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
