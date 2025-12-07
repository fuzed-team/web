import { AdminLayout } from "@/features/admin/components/layout/admin-layout";

export default function LiveMatchesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AdminLayout
			title="User Flags"
			description="Review and manage user reports and flags."
		>
			{children}
		</AdminLayout>
	);
}
