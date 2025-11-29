import {
	Bell,
	Command,
	Monitor,
	Palette,
	Settings,
	UserCog,
	Users,
	Wrench,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
	user: {
		name: "satnaing",
		email: "satnaingdev@gmail.com",
		avatar: "/avatars/shadcn.jpg",
	},
	teams: [
		{
			name: "Fuzzed Admin",
			logo: Command,
			plan: "",
		},
	],
	navGroups: [
		{
			title: "General",
			items: [
				// {
				// 	title: "Dashboard",
				// 	url: "/",
				// 	icon: LayoutDashboard,
				// },
				// {
				// 	title: "Chats",
				// 	url: "/chats",
				// 	badge: "3",
				// 	icon: MessagesSquare,
				// },
				{
					title: "Live Matches",
					url: "/admin/live-matches",
					icon: Command,
				},
				{
					title: "Users",
					url: "/admin/users",
					icon: Users,
				},
				{
					title: "Flags",
					url: "/admin/flags",
					icon: Bell,
				},
			],
		},
		{
			title: "Other",
			items: [
				{
					title: "Settings",
					icon: Settings,
					url: "/admin/settings",
					// items: [
					// 	{
					// 		title: "Profile",
					// 		url: "/settings",
					// 		icon: UserCog,
					// 	},
					// 	{
					// 		title: "Account",
					// 		url: "/settings/account",
					// 		icon: Wrench,
					// 	},
					// ],
				},
			],
		},
	],
};
