import { ProfileDropdown } from "@/components/profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { Search } from "../search";
import { ThemeSwitch } from "../theme-switch";
import { Header } from "./header";
import { Main } from "./main";

type AdminLayoutProps = {
	children?: React.ReactNode;
	title?: string;
	description?: string;
};

export function AdminLayout({
	title,
	description,
	children,
}: AdminLayoutProps) {
	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					{/* <ConfigDrawer /> */}
					<ProfileDropdown />
				</div>
			</Header>

			<Main fixed>
				{title && (
					<>
						<div className="space-y-0.5">
							<h1 className="text-2xl font-bold tracking-tight md:text-3xl">
								{title}
							</h1>
							<p className="text-muted-foreground">{description}</p>
						</div>
						<Separator className="my-4 lg:my-6" />
					</>
				)}
				{children}
			</Main>
		</>
	);
}
