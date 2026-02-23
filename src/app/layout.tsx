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

// Note: Removed force-dynamic from root layout for performance optimization
// Dynamic rendering is now handled per-route as needed:
// - Authenticated routes use force-dynamic via (authenticated)/layout.tsx
// - Public API routes use appropriate caching strategies (see vercel.json)
// - Pages with auth checks are naturally dynamic due to cookie dependencies
