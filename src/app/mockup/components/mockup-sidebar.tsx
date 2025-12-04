"use client";

import { motion } from "framer-motion";
import { History, LayoutGrid, MessageCircle, Upload } from "lucide-react";

export function MockupSidebar() {
	return (
		<motion.aside
			initial={{ opacity: 0, x: -20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
			className="w-72 bg-sidebar border-r border-sidebar-border flex-shrink-0 flex flex-col h-full overflow-y-auto hidden md:flex"
		>
			{/* Logo */}
			<div className="p-6 pb-2">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20 from-primary to-purple-700 text-primary-foreground">
						F
					</div>
					<h1 className="text-xl font-semibold tracking-tight text-sidebar-foreground">
						Fuzed
					</h1>
				</div>
			</div>

			{/* User Profile */}
			<div className="px-6 py-6">
				<div className="flex items-center gap-3 mb-2">
					<img
						src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop"
						alt="User"
						className="w-12 h-12 rounded-full object-cover border-2 border-sidebar-border shadow-sm"
					/>
					<div>
						<h3 className="font-medium text-base text-sidebar-foreground">
							Alex Smith
						</h3>
						<div className="w-32 h-1.5 bg-sidebar-accent rounded-full mt-1.5 overflow-hidden">
							<div className="h-full bg-gradient-to-r from-primary w-[110%] rounded-full to-purple-600" />
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							12 Photos Uploaded
						</p>
					</div>
				</div>
				<button
					type="button"
					className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-sidebar-border text-xs font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors"
				>
					<Upload className="w-3.5 h-3.5" />
					Upload New Photo
				</button>
			</div>

			{/* Navigation */}
			<nav className="px-3 space-y-1 mb-6">
				<a
					href="#"
					className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-foreground font-medium transition-colors border border-transparent"
				>
					<LayoutGrid className="w-5 h-5 text-primary" />
					Discover Matches
				</a>
				<a
					href="#"
					className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors font-normal"
				>
					<MessageCircle className="w-5 h-5" />
					My Chats
				</a>
				<a
					href="#"
					className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors font-normal"
				>
					<History className="w-5 h-5" />
					Match History
				</a>
			</nav>
		</motion.aside>
	);
}
