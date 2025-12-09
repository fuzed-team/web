"use client";

import {
	Bell,
	Clock,
	History,
	LayoutGrid,
	LogOut,
	MessageCircle,
	Sparkles,
	Sun,
	User,
} from "lucide-react";
import Image from "next/image";

export function BrowserMockup() {
	return (
		<div className="relative max-w-6xl mx-auto mt-12">
			<div className="md:rounded-2xl overflow-hidden bg-white border-slate-200 border ring-slate-900/5 ring-1 rounded-xl relative shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)]">
				{/* Animated Beam Border */}
				<svg
					className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-[inherit]"
					style={{ overflow: "visible" }}
				>
					<defs>
						<linearGradient
							id="beam-gradient"
							x1="0%"
							y1="0%"
							x2="100%"
							y2="100%"
						>
							<stop offset="0%" stopColor="#8b5cf6" />
							<stop offset="50%" stopColor="#3b82f6" />
							<stop offset="100%" stopColor="#ec4899" />
						</linearGradient>
						<filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
					<rect
						className="animate-beam-border"
						rx="12"
						ry="12"
						x="0.5"
						y="0.5"
						width="calc(100% - 1px)"
						height="calc(100% - 1px)"
						fill="none"
						stroke="url(#beam-gradient)"
						strokeWidth="3"
						strokeLinecap="round"
						pathLength="100"
						strokeDasharray="6 94"
						filter="url(#beam-glow)"
					/>
				</svg>

				{/* Browser Chrome */}
				<div className="md:h-12 flex gap-4 z-20 bg-slate-50 h-10 border-slate-100 border-b px-4 relative items-center">
					<div className="flex items-center gap-2 px-1">
						<div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
						<div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]" />
						<div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
					</div>
					<div className="flex-1 max-w-xl mx-auto hidden sm:flex">
						<div className="flex text-[10px] md:text-xs gap-2 text-slate-400 bg-white w-full h-7 border-slate-200 border rounded-md items-center justify-center">
							fuzzed.com/your-matches
						</div>
					</div>
				</div>

				{/* Application View */}
				<div className="relative bg-white h-[650px] md:h-[750px] flex">
					{/* Sidebar (Desktop) */}
					<div className="w-64 border-r border-slate-100 hidden md:flex flex-col bg-[#F8F9FA]">
						{/* User Profile Snippet */}
						<div className="px-6 py-6">
							<div className="flex items-center gap-3">
								<div className="relative">
									<Image
										src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
										alt="User"
										width={40}
										height={40}
										className="w-10 h-10 rounded-full border border-slate-200 object-cover"
									/>
									<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
								</div>
								<div>
									<div className="text-sm font-semibold text-slate-900">
										Nam
									</div>
									<div className="text-[10px] font-medium text-slate-400">
										5 Photos Uploaded
									</div>
								</div>
							</div>
						</div>
						{/* Navigation */}
						<div className="px-3 space-y-1">
							<SidebarLink icon={LayoutGrid} label="Discover Matches" active />
							<SidebarLink icon={MessageCircle} label="My Chats" />
							<SidebarLink icon={History} label="Baby History" />
							<SidebarLink icon={User} label="Profile" />
						</div>
						<div className="mt-auto px-3 py-6 border-t border-slate-200/60">
							<SidebarLink icon={LogOut} label="Log Out" />
						</div>
					</div>

					{/* Main Content */}
					<div className="flex-1 flex flex-col min-w-0 bg-white relative">
						<div className="h-16 border-b border-slate-50 flex items-center justify-between px-6 md:px-8 bg-white shrink-0 z-10">
							<div className="md:hidden flex items-center gap-2"></div>
							<div className="hidden md:block" />
							<div className="flex items-center gap-4 text-slate-400">
								<button
									type="button"
									className="hover:text-slate-600 transition-colors"
								>
									<Sun className="w-5 h-5" />
								</button>
								<button
									type="button"
									className="hover:text-slate-600 transition-colors relative"
								>
									<Bell className="w-5 h-5" />
									<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
								</button>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto p-4 md:p-8">
							{/* Banner */}
							<div className="w-full bg-gradient-to-r from-[#4f25c7] via-[#5b2ad4] to-[#3b3dbf] rounded-2xl md:rounded-3xl p-6 md:p-10 text-white relative overflow-hidden mb-8 shadow-xl shadow-indigo-900/10">
								<div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
								<div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
								<div className="relative z-10 flex flex-col-reverse md:flex-row justify-between items-center gap-8">
									<div className="text-left max-w-lg w-full">
										<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-semibold mb-6 shadow-sm">
											<div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
											<span className="tracking-wide uppercase">
												Daily Featured Match
											</span>
										</div>
										<h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
											Celebrity Match of the Day
										</h2>
										<p className="text-indigo-100 text-sm md:text-base mb-2 font-medium">
											Discover the daily featured celebrity similarity match.
										</p>
										<p className="text-xs text-indigo-200/70">
											Actress known for Harry Potter series
										</p>
									</div>
									<div className="relative group shrink-0 w-full md:w-auto flex justify-center md:block">
										<div className="w-full max-w-[280px] md:w-64 aspect-video rounded-xl overflow-hidden relative shadow-2xl ring-4 ring-white/10 transform transition hover:scale-105 duration-500">
											<Image
												src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg"
												alt="Emma Watson"
												fill
												className="object-cover"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
											<div className="absolute bottom-3 left-0 right-0 text-center text-xs font-semibold text-white/90">
												Emma Watson
											</div>
										</div>
										<div className="absolute -top-3 -right-2 md:-right-4 bg-white text-indigo-700 font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg border border-indigo-50 z-20">
											46%
										</div>
									</div>
								</div>
							</div>

							{/* Cards Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
								<MatchCard
									name="Natalie Dibbert"
									image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
									percentage="51%"
									time="44m ago"
								/>
								<MatchCard
									name="Vera Upton"
									image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop"
									percentage="53%"
									time="44m ago"
								/>
								<MatchCard
									name="Charlene Purdy"
									image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"
									percentage="51%"
									time="1h ago"
								/>
								<MatchCard
									name="Patricia Heath"
									image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop"
									percentage="51%"
									time="1h ago"
								/>
							</div>
							<div className="h-8" />
						</div>
					</div>
				</div>
			</div>
			{/* Decorative Elements */}
			<div className="-top-12 -right-12 -z-10 bg-purple-500/10 w-64 h-64 rounded-full absolute blur-3xl" />
			<div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
		</div>
	);
}

function SidebarLink({
	icon: Icon,
	label,
	active,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	active?: boolean;
}) {
	return (
		<button
			type="button"
			className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors w-full ${
				active
					? "text-indigo-700 bg-indigo-50/80"
					: "text-slate-500 hover:bg-slate-100 hover:text-slate-900 group"
			}`}
		>
			<Icon
				className={`w-[18px] h-[18px] ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
			/>
			{label}
		</button>
	);
}

function MatchCard({
	name,
	image,
	percentage,
	time,
}: {
	name: string;
	image: string;
	percentage: string;
	time: string;
}) {
	return (
		<div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-col hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
			<div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3 bg-slate-100">
				<Image src={image} alt={name} fill className="object-cover" />
				<div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold text-indigo-600 shadow-sm border border-slate-100">
					{percentage}
				</div>
			</div>
			<div className="px-1 mb-4">
				<h3 className="font-bold text-slate-900 text-sm mb-0.5">{name}</h3>
				<div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
					<Clock className="w-[10px] h-[10px]" />
					{time}
				</div>
			</div>
			<button
				type="button"
				className="mt-auto w-full py-2.5 rounded-lg bg-[#F0F2FF] text-[#4F46E5] text-[11px] font-semibold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
			>
				<Sparkles className="w-3.5 h-3.5" />
				Generate Baby
			</button>
		</div>
	);
}
