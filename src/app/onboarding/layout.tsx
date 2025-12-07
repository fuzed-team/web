import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
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
		.select("*")
		.eq("id", user.id)
		.single();

	// Redirect if account is suspended or deleted
	if (profile?.status === "suspended" || profile?.status === "deleted") {
		redirect("/auth/sign-in");
	}

	if (profile?.name && profile?.school && profile?.gender) {
		redirect("/your-matches");
	}

	return <>{children}</>;
}
