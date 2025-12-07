import { Baby, LayoutGrid, MessageCircle, User } from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	navGroups: [
		{
			items: [
				{
					title: "Discover Matches",
					url: "/your-matches",
					icon: LayoutGrid,
				},
				{
					title: "My Chats",
					url: "/chat",
					icon: MessageCircle,
				},
				{
					title: "Baby History",
					url: "/baby-history",
					icon: Baby,
				},
				{
					title: "Profile",
					url: "/profile",
					icon: User,
				},
			],
		},
	],
};
