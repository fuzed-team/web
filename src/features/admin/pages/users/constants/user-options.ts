import { IconUser, IconUserShield } from "@tabler/icons-react";

export const userRoleOptions = [
	{
		value: "admin",
		icon: IconUserShield,
		label: "Admin",
	},
	{
		value: "user",
		icon: IconUser,
		label: "User",
	},
];

export const userStatusOptions = [
	{
		value: "active",
		label: "Active",
	},
	{
		value: "suspended",
		label: "Suspended",
	},
	{
		value: "deleted",
		label: "Deleted",
	},
];

// For backwards compatibility
export const userRoleOptionsFn = () => userRoleOptions;
