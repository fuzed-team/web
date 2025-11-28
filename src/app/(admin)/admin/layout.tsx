import { redirect } from "next/navigation";
import { NavigationProgress } from "@/components/navigation-progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/admin/components/layout/app-sidebar";
import { SkipToMain } from "@/features/admin/components/skip-to-main";
import { DirectionProvider } from "@/features/admin/context/direction-provider";
import { LayoutProvider } from "@/features/admin/context/layout-provider";
import { SearchProvider } from "@/features/admin/context/search-provider";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getCookie } from "@/lib/utils/cookies";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const defaultOpen = getCookie("sidebar_state") !== "false";

	// Check authentication
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		redirect("/auth/sign-in");
	}

	// Fetch user profile to check role
	const { data: profile, error: profileError } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profileError || !profile) {
		redirect("/");
	}

	// Check if user has admin role
	if (profile.role !== "admin") {
		// Redirect non-admin users to home page
		redirect("/");
	}

	return (
		<DirectionProvider>
			<SearchProvider>
				<LayoutProvider>
					<SidebarProvider defaultOpen={defaultOpen}>
						<NavigationProgress />
						<SkipToMain />
						<AppSidebar />
						<SidebarInset
							className={cn(
								"bg-transparent",
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
		</DirectionProvider>
	);
}
