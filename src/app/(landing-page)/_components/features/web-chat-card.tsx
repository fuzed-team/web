"use client";

import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { SpotlightCard } from "@/components/spotlight-card";
import AnimationContainer from "../global/animation-container";

export function WebChatCard() {
	return (
		<AnimationContainer delay={0.6}>
			<SpotlightCard
				className="h-full md:col-span-1 spotlight-card bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
				spotlightColor="rgba(99, 102, 241, 0.15)"
			>
				<div className="relative z-10">
					<div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
						<MessageCircle className="w-6 h-6" />
					</div>
					<h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
						Web Chat
					</h3>
					<p className="text-sm text-slate-500 font-normal">
						Real-time messaging directly in the dashboard.
					</p>
				</div>
				<div className="mt-8 space-y-3">
					<div className="flex gap-2">
						<div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 overflow-hidden ring-1 ring-white">
							<Image
								src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=100&auto=format&fit=crop"
								alt="User"
								width={24}
								height={24}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="bg-white text-slate-600 text-xs px-3 py-2 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
							Did you see the result? 😂
						</div>
					</div>
					<div className="flex gap-2 flex-row-reverse">
						<div className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-2xl rounded-tr-none shadow-md shadow-indigo-500/20">
							It has your eyes!
						</div>
					</div>
				</div>
			</SpotlightCard>
		</AnimationContainer>
	);
}
