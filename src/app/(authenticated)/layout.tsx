import { redirect } from "next/navigation";
import { RootLayout } from "@/components/layout/root-layout";
import { createClient } from "@/lib/supabase/server";

export default async function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		redirect("/auth/sign-in");
	}

	// Fetch user profile to check account status
	const { data: profile } = await supabase
		.from("profiles")
		.select("status")
		.eq("id", user.id)
		.single();

	// Redirect if account is suspended or deleted
	if (profile?.status === "suspended" || profile?.status === "deleted") {
		redirect("/auth/sign-in");
	}

	return <RootLayout>{children}</RootLayout>;
}
