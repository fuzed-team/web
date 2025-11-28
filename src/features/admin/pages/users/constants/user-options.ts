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

// For backwards compatibility
export const userRoleOptionsFn = () => userRoleOptions;
