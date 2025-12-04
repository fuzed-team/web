import { Geist, Inter } from "next/font/google";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const geist = Geist({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-geist",
});

export default function MockupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className={`${inter.variable} ${geist.variable} font-sans`}>
			{children}
		</div>
	);
}
