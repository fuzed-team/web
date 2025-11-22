"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface HowItWorksStepProps {
	icon: LucideIcon;
	number: number;
	title: string;
	description: string;
	details?: string[];
	index: number;
}

export function HowItWorksStep({
	icon: Icon,
	number,
	title,
	description,
	details,
	index,
}: HowItWorksStepProps) {
	return (
		<motion.div
			initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
			whileInView={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6, delay: index * 0.2 }}
			viewport={{ once: true }}
			className="relative"
		>
			<div className="flex flex-col md:flex-row items-center gap-6">
				{/* Step Number Circle */}
				<div className="relative flex-shrink-0">
					<div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
						{number}
					</div>
					<div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
				</div>

				{/* Content */}
				<div className="flex-grow text-center md:text-left">
					<div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
						<Icon className="w-6 h-6 text-primary" />
						<h3 className="text-2xl font-bold">{title}</h3>
					</div>
					<p className="text-muted-foreground text-lg mb-4">
						{description}
					</p>
					{details && details.length > 0 && (
						<ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
							{details.map((detail, idx) => (
								<li key={idx} className="flex items-start">
									<span className="mr-2 text-primary">✓</span>
									<span>{detail}</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			{/* Connector Line (not on last step) */}
			{index < 2 && (
				<div className="hidden md:block absolute left-10 top-20 w-0.5 h-20 bg-gradient-to-b from-primary to-transparent" />
			)}
		</motion.div>
	);
}
