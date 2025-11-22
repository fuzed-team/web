import { Header } from "@radix-ui/react-accordion";
import { redirect } from "next/navigation";
import { Footer } from "react-day-picker";
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

	return (
		<div className="min-h-screen w-full bg-white relative">
			{/* Dual Gradient Overlay (Bottom) Background */}
			<div
				className="absolute inset-0 z-0"
				style={{
					backgroundImage: `
        linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
        radial-gradient(circle 500px at 20% 100%, rgba(139,92,246,0.3), transparent),
        radial-gradient(circle 500px at 100% 80%, rgba(59,130,246,0.3), transparent)
      `,
					backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
				}}
			/>
			<Header />
			<main className="pt-20 mx-auto w-full z-0 relative">
				<LandingPage />
			</main>
			<Footer />
		</div>
	);
};

export default HomePage;
