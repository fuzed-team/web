import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { createClient } from "@/lib/supabase/server";
import Footer from "./_components/navigations/footer";
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

		return redirect("/your-matches");
	}

	return (
		<>
			<Header />
			<div className="min-h-screen w-full bg-white relative selection:bg-indigo-500/10 selection:text-indigo-600">
				<main className="w-full z-0 relative">
					<LandingPage />
				</main>
				<Footer />
			</div>
		</>
	);
};

export default HomePage;
