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
					Live Matches
				</h1>
				<p className="text-muted-foreground">Manage live matches</p>
			</div>
			<Separator className="my-4 lg:my-6" />
			<div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
				<aside className="top-0 lg:sticky lg:w-1/5"></aside>
				<div className="flex w-full overflow-y-hidden p-1">{children}</div>
			</div>
		</Main>
	</>;
}
