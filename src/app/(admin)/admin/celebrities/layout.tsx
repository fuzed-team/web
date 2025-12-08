import type { Metadata } from "next";
import { AdminLayout } from "@/features/admin/components/layout/admin-layout";

export const metadata: Metadata = {
	title: "Celebrities",
};

export default function CelebritiesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AdminLayout>{children}</AdminLayout>;
}
