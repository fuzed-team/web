"use client";

import { ProfileDropdown } from "@/components/profile-dropdown";
import { ConfigDrawer } from "@/features/admin/components/config-drawer";
import { Header } from "@/features/admin/components/layout/header";
import { Main } from "@/features/admin/components/layout/main";
import { Search } from "@/features/admin/components/search";
import { ThemeSwitch } from "@/features/admin/components/theme-switch";
import { UsersDialogs } from "@/features/admin/pages/users/components/users-dialogs";
import { UsersProvider } from "@/features/admin/pages/users/components/users-provider";

export default function UsersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<UsersProvider>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6">{children}</Main>

			<UsersDialogs />
		</UsersProvider>
	);
}
