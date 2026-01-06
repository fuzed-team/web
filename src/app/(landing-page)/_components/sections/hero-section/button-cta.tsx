import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export function ButtonCTA() {
	return (
		<Link
			href="/auth/sign-in"
			className="relative overflow-hidden w-full sm:w-auto h-12 px-8 rounded-full flex items-center justify-center gap-2 text-white font-medium text-sm transition-all duration-300 active:scale-95 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 ring-1 ring-white/20 group"
			style={{
				background:
					"radial-gradient(65.28% 65.28% at 50% 100%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%), linear-gradient(0deg, #7a5af8, #7a5af8)",
			}}
		>
			{/* Shine Effect */}
			<div className="absolute top-0 left-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10 animate-shine" />

			{/* Floating Particles */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-100 left-[10%]"
					style={{
						animation: "floating-points 2.35s infinite ease-in-out 0.2s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-70 left-[30%]"
					style={{
						animation: "floating-points 2.5s infinite ease-in-out 0.5s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-80 left-[25%]"
					style={{
						animation: "floating-points 2.2s infinite ease-in-out 0.1s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-60 left-[44%]"
					style={{
						animation: "floating-points 2.05s infinite ease-in-out",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-100 left-[50%]"
					style={{
						animation: "floating-points 1.9s infinite ease-in-out",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-50 left-[75%]"
					style={{
						animation: "floating-points 1.5s infinite ease-in-out 1.5s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-90 left-[88%]"
					style={{
						animation: "floating-points 2.2s infinite ease-in-out 0.2s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-80 left-[58%]"
					style={{
						animation: "floating-points 2.25s infinite ease-in-out 0.2s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-60 left-[98%]"
					style={{
						animation: "floating-points 2.6s infinite ease-in-out 0.1s",
					}}
				/>
				<div
					className="absolute bottom-[-10px] w-0.5 h-0.5 bg-white rounded-full opacity-100 left-[65%]"
					style={{
						animation: "floating-points 2.5s infinite ease-in-out 0.2s",
					}}
				/>
			</div>
			<span className="relative z-20 flex items-center gap-2">
				Get Started
				<ArrowUpRight className="w-4 h-4" />
			</span>
		</Link>
	);
}
