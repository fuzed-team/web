import { Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "@/assets/logo";
import { Button } from "@/components/ui/button";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppTitle() {
	const { setOpenMobile } = useSidebar();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					className="gap-0 py-0 hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:p-0!"
					asChild
				>
					<div>
						<Link
							href="/"
							onClick={() => setOpenMobile(false)}
							className="flex-1 flex items-center text-sm"
						>
							<Logo className="size-12 -ml-2" />
							<div className="flex flex-col relative -ml-2">
								<span className="truncate text-foreground text-lg font-bold">
									uzed
								</span>
								<span className="truncate text-muted-foreground -mt-1 text-xs leading-none">
									Admin Panel
								</span>
							</div>
						</Link>
						<ToggleSidebar />
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

function ToggleSidebar({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { toggleSidebar } = useSidebar();

	return (
		<Button
			data-sidebar="trigger"
			data-slot="sidebar-trigger"
			variant="ghost"
			size="icon"
			className={cn("aspect-square size-8 max-md:scale-125", className)}
			onClick={(event) => {
				onClick?.(event);
				toggleSidebar();
			}}
			{...props}
		>
			<X className="md:hidden" />
			<Menu className="max-md:hidden" />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	);
}
