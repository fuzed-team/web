import { LayoutGrid, MessageCircle } from "lucide-react";
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
				// {
				// 	title: "History",
				// 	url: "/history",
				// 	icon: History,
				// },
			],
		},
	],
};
