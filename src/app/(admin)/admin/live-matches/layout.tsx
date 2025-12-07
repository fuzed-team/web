import { AdminLayout } from "@/features/admin/components/layout/admin-layout";

export default function LiveMatchesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AdminLayout
			title="Live Matches"
			description="Manage your live matches here."
		>
			{children}
		</AdminLayout>
	);
}
