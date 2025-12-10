import { Toaster } from "@/components/ui/sonner";
import { getMeQueryOptions } from "@/features/auth/api/get-me";
import { cn } from "@/lib/utils";
import "@/styles/styles.css";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Merriweather } from "next/font/google";
import { Providers } from "./providers";

export const metadata: Metadata = {
	title: "Fuzed - University Match & Baby Generator",
	description: "AI Face Matching Application",
	icons: {
		icon: "/favicon.ico",
		apple: "/logo192.png",
	},
	manifest: "/manifest.json",
};

export const viewport: Viewport = {
	themeColor: "#000000",
};

const fontSans = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontSerif = Merriweather({
	subsets: ["latin"],
	weight: ["300", "400", "700", "900"],
	variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery(getMeQueryOptions());

	const dehydratedState = dehydrate(queryClient);

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={cn(fontSans.variable, fontSerif.variable, fontMono.variable)}
			>
				<Providers>
					<HydrationBoundary state={dehydratedState}>
						{children}
					</HydrationBoundary>
				</Providers>
				<Toaster duration={3000} />
			</body>
		</html>
	);
}

// We are not prerendering anything because the app is highly dynamic
// and the data depends on the user so we need to send cookies with each request
export const dynamic = "force-dynamic";
