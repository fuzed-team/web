import { ProfileDropdown } from "@/components/profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/features/admin/components/layout/header";
import { Main } from "@/features/admin/components/layout/main";
import { Search } from "@/features/admin/components/search";

export default function LiveMatchesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			{/* ===== Top Heading ===== */}
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					{/* <ThemeSwitch /> */}
					{/* <ConfigDrawer /> */}
					<ProfileDropdown />
				</div>
			</Header>

			<Main fixed>
				<div className="space-y-0.5">
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl">
						User Flags
					</h1>
					<p className="text-muted-foreground">
						Review and manage user reports and flags.
					</p>
				</div>
				<Separator className="my-4 lg:my-6" />
				{children}
			</Main>
		</>
	);
}
