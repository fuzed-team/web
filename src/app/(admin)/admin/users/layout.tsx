"use client";

import { AdminLayout } from "@/features/admin/components/layout/admin-layout";

export default function UsersLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AdminLayout>{children}</AdminLayout>;
}
