import { Gauge, Settings, ToggleLeft } from "lucide-react";
import { AdminSidebarNav } from "@/features/admin/components/admin-sidebar-nav";
import { AdminLayout } from "@/features/admin/components/layout/admin-layout";

const adminSidebarNavItems = [
	{
		title: "Matching Algorithm",
		href: "/admin/settings/matching-algorithm",
		icon: <Settings size={18} />,
	},
	{
		title: "Rate Limits",
		href: "/admin/settings/rate-limits",
		icon: <Gauge size={18} />,
	},
	{
		title: "Feature Toggles",
		href: "/admin/settings/feature-toggles",
		icon: <ToggleLeft size={18} />,
	},
];

export default function SettingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AdminLayout
			title="Settings"
			description="Manage your account settings and set e-mail preferences."
		>
			<div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
				<aside className="top-0 lg:sticky lg:w-1/5">
					<AdminSidebarNav items={adminSidebarNavItems} />
				</aside>
				<div className="flex w-full overflow-y-hidden p-1">{children}</div>
			</div>
		</AdminLayout>
	);
}
