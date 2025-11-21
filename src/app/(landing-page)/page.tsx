import { redirect } from "next/navigation";
import { HomeContent } from "@/components/home-content";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "./_pages/landing-page";

const HomePage = async () => {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (user && !authError) {
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single();

		// TODO: Add a check for age
		const isOnboarding = profile && (!profile?.name || !profile?.gender);

		if (profileError || isOnboarding) {
			return redirect("/onboarding");
		}

		return <HomeContent />;
	}

	return <LandingPage />;
};

export default HomePage;
