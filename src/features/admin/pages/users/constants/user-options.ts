import {
	IconBan,
	IconCircleCheck,
	IconUser,
	IconUserShield,
} from "@tabler/icons-react";

export const userRoleOptions = [
	{
		icon: IconUserShield,
		value: "admin",
		label: "Admin",
	},
	{
		icon: IconUser,
		value: "user",
		label: "User",
	},
];

export const userStatusOptions = [
	{
		icon: IconCircleCheck,
		value: "active",
		label: "Active",
	},
	{
		icon: IconBan,
		value: "suspended",
		label: "Suspended",
	},
];

// For backwards compatibility
export const userRoleOptionsFn = () => userRoleOptions;
