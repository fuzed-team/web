"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function PhotoSelector() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
			className="relative group mb-6"
		>
			<div className="flex overflow-x-auto gap-3 pb-4 snap-x-mandatory hide-scrollbar">
				{/* Add New */}
				<div className="flex-shrink-0 snap-center">
					<button
						type="button"
						className="w-20 h-24 md:w-24 md:h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all group-hover:scale-100"
					>
						<Plus className="w-6 h-6" />
						<span className="text-xs font-medium">Add Photo</span>
					</button>
				</div>

				{/* Active Photo */}
				<div className="flex-shrink-0 relative snap-center cursor-pointer">
					<div className="absolute -top-2 -right-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm bg-primary text-primary-foreground">
						Selected
					</div>
					<div className="w-20 h-24 md:w-24 md:h-32 rounded-xl p-0.5 bg-gradient-to-br from-primary shadow-lg shadow-primary/25 ring-2 ring-offset-2 ring-offset-background ring-primary/50 to-purple-600">
						<img
							src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
							className="w-full h-full object-cover rounded-[10px]"
							alt="Active"
						/>
					</div>
				</div>

				{/* Other User Photos */}
				{[
					"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
					"https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop",
					"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop",
				].map((src, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={i}
						className="flex-shrink-0 snap-center cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
					>
						<div className="w-20 h-24 md:w-24 md:h-32 rounded-xl overflow-hidden border border-border">
							<img
								src={src}
								className="w-full h-full object-cover"
								alt={`Other ${i + 1}`}
							/>
						</div>
					</div>
				))}
			</div>
		</motion.div>
	);
}
