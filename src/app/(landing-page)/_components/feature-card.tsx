"use client";

import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import MagicCard from "./ui/magic-card";

interface FeatureCardProps {
	icon: LucideIcon;
	title: string;
	description: string;
	details?: string[];
	index: number;
}

export function FeatureCard({
	icon: Icon,
	title,
	description,
	details,
	index,
}: FeatureCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			viewport={{ once: true }}
		>
			<MagicCard className="h-full p-6 group cursor-pointer">
				<div className="flex flex-col h-full">
					<div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
						<Icon className="w-6 h-6" />
					</div>
					<h3 className="text-xl font-semibold mb-2">{title}</h3>
					<p className="text-muted-foreground mb-4 flex-grow">
						{description}
					</p>
					{details && details.length > 0 && (
						<ul className="space-y-2 text-sm text-muted-foreground">
							{details.map((detail, idx) => (
								<li key={idx} className="flex items-start">
									<span className="mr-2 text-primary">•</span>
									<span>{detail}</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</MagicCard>
		</motion.div>
	);
}
