"use client";

import { GraduationCap } from "lucide-react";
import Image from "next/image";
import { SpotlightCard } from "@/components/spotlight-card";
import AnimationContainer from "../global/animation-container";

export function CampusConnectCard() {
	return (
		<AnimationContainer delay={0.3}>
			<SpotlightCard
				className="md:col-span-1 p-8 flex flex-col overflow-hidden relative group shadow-sm h-full bg-[#080B16]"
				spotlightColor="rgba(99, 102, 241, 0.3)"
			>
				<div className="relative z-10 mb-8">
					<div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm flex items-center justify-center text-indigo-400 mb-6 ring-1 ring-white/5">
						<GraduationCap className="w-6 h-6" />
					</div>
					<h3 className="text-xl font-medium mb-2 tracking-tight text-white">
						Campus Connect
					</h3>
					<p className="text-sm text-slate-400 leading-relaxed font-normal">
						Securely match with students on your campus. We verify .edu emails
						to ensure a safe, students-only network.
					</p>
				</div>

				{/* Simulated List UI */}
				<div className="relative flex-1 bg-white/5 rounded-t-xl border-x border-t border-white/10 shadow-sm overflow-hidden p-5 w-full ring-1 ring-black/5 mt-auto">
					<div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
						<span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
							Top Matches
						</span>
					</div>
					<div className="space-y-4">
						{/* List Item 1 */}
						<ListItem
							name="Jessica M."
							school="UCLA"
							percentage="68%"
							image="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=100&auto=format&fit=crop"
							online
						/>
						{/* List Item 2 */}
						<ListItem
							name="Tyler D."
							school="Columbia"
							percentage="64%"
							image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
						/>
					</div>
					<div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#13161f] via-[#13161f]/80 to-transparent" />
				</div>
			</SpotlightCard>
		</AnimationContainer>
	);
}

function ListItem({
	name,
	school,
	percentage,
	image,
	online,
}: {
	name: string;
	school: string;
	percentage: string;
	image: string;
	online?: boolean;
}) {
	return (
		<div className="flex items-center gap-3">
			<div className="relative">
				<Image
					src={image}
					alt={name}
					width={40}
					height={40}
					className="w-10 h-10 rounded-full object-cover ring-2 ring-[#080B16]"
				/>
				{online && (
					<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#080B16] rounded-full flex items-center justify-center">
						<div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-[#080B16]" />
					</div>
				)}
			</div>
			<div>
				<div className="text-xs font-semibold text-white">{name}</div>
				<div className="text-[10px] text-slate-500 font-medium">{school}</div>
			</div>
			<div className="ml-auto text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
				{percentage}
			</div>
		</div>
	);
}
