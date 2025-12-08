import { Bell, Command, Radio, Settings, Star, Users } from "lucide-react";
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
				{
					title: "Live Matches",
					url: "/admin/live-matches",
					icon: Radio,
				},
				{
					title: "Users",
					url: "/admin/users",
					icon: Users,
				},
				{
					title: "Celebrities",
					url: "/admin/celebrities",
					icon: Star,
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
				},
			],
		},
	],
};
