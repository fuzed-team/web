import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/admin/components/layout/app-sidebar";
import { SkipToMain } from "@/features/admin/components/skip-to-main";
import { LayoutProvider } from "@/features/admin/context/layout-provider";
import { SearchProvider } from "@/features/admin/context/search-provider";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/utils/cookies";

type AuthenticatedLayoutProps = {
	children?: React.ReactNode;
};

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
	const defaultOpen = getCookie("sidebar_state") !== "false";
	return (
		<SearchProvider>
			<LayoutProvider>
				<SidebarProvider defaultOpen={defaultOpen}>
					<SkipToMain />
					<AppSidebar />
					<SidebarInset
						className={cn(
							// Set content container, so we can use container queries
							"@container/content",

							// If layout is fixed, set the height
							// to 100svh to prevent overflow
							"has-data-[layout=fixed]:h-svh",

							// If layout is fixed and sidebar is inset,
							// set the height to 100svh - spacing (total margins) to prevent overflow
							"peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
						)}
					>
						{children}
					</SidebarInset>
				</SidebarProvider>
			</LayoutProvider>
		</SearchProvider>
	);
}
