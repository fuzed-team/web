"use client";

import { motion } from "framer-motion";

export function MatchHero() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
			className="md:p-10 overflow-hidden group bg-gradient-to-r w-full rounded-3xl mb-10 pt-8 pr-8 pb-8 pl-8 relative shadow-2xl shadow-purple-900/20 text-white from-violet-900 via-purple-800 to-blue-800"
		>
			<div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

			<div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
				<div className="max-w-xl space-y-4 text-center md:text-left">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border text-xs font-medium border-purple-400/30 text-purple-100">
						<span className="w-2 h-2 rounded-full animate-pulse bg-pink-400" />
						Top Pick for Selected Photo
					</div>
					<h3 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
						Match of the Day
					</h3>
					<p className="text-base md:text-lg font-light leading-relaxed max-w-md mx-auto md:mx-0 text-purple-100">
						Highest overall compatibility based on your selected portrait.
					</p>
				</div>

				<div className="flex-shrink-0 relative">
					<div className="absolute -top-4 -right-4 z-20 text-center animate-bounce duration-1000">
						<span className="inline-block px-3 py-1 font-bold rounded-lg shadow-lg text-lg bg-white text-purple-900">
							98%
						</span>
					</div>
					<div className="relative w-48 h-48 md:w-56 md:h-56">
						<img
							src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop"
							alt="Celebrity"
							className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/10"
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
