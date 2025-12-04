"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { MatchHero } from "./components/match-hero";
import { MatchesGrid } from "./components/matches-grid";
import { MockupSidebar } from "./components/mockup-sidebar";
import { PhotoSelector } from "./components/photo-selector";

export default function MockupPage() {
	return (
		<div className="flex h-screen overflow-hidden bg-background text-foreground font-sans antialiased selection:bg-primary/30 selection:text-primary">
			<MockupSidebar />

			{/* Main Content */}
			<main className="flex-1 overflow-y-auto relative scroll-smooth">
				<div className="max-w-7xl mx-auto px-6 py-8 md:px-10 md:py-10">
					{/* Mobile Header */}
					<div className="md:hidden flex items-center justify-between mb-6">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center font-bold text-lg from-primary to-purple-700 text-primary-foreground">
								F
							</div>
							<h1 className="text-lg font-semibold text-foreground">Fuzed</h1>
						</div>
						<button type="button" className="p-2 text-muted-foreground">
							<Menu className="w-6 h-6" />
						</button>
					</div>

					{/* Page Title & Controls */}
					<motion.header
						initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
						className="mb-6"
					>
						<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
							<div>
								<h2 className="md:text-2xl text-xl font-semibold tracking-tight text-foreground">
									Matches for{" "}
									<span className="bg-gradient-to-r bg-clip-text text-transparent from-primary to-purple-600">
										Portrait #1
									</span>
								</h2>
								<p className="text-muted-foreground mt-1">
									Select a photo below to see who matches with it.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
									Sort by:
								</span>
								<select className="bg-transparent text-sm font-medium border-none outline-none cursor-pointer focus:ring-0 text-foreground">
									<option>Highest %</option>
									<option>Newest</option>
									<option>Nearby</option>
								</select>
							</div>
						</div>

						{/* PHOTO SELECTOR STRIP (Active Photo Context) */}
						<PhotoSelector />
					</motion.header>

					{/* Hero Section */}
					<MatchHero />

					{/* Matches Grid */}
					<MatchesGrid />
				</div>
			</main>
		</div>
	);
}
