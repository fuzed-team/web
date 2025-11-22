"use client";

import { motion } from "framer-motion";
import { Check, type LucideIcon } from "lucide-react";
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
			className="h-full"
		>
			<MagicCard className="h-full p-8 group cursor-pointer flex flex-col justify-between gap-6 bg-gradient-to-b from-background to-primary/5 border-primary/10">
				<div>
					<div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary/10">
						<Icon className="w-7 h-7" />
					</div>
					<h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
					<p className="text-muted-foreground mb-6 leading-relaxed">
						{description}
					</p>
					{details && details.length > 0 && (
						<ul className="space-y-3 text-sm text-muted-foreground/80">
							{details.map((detail, idx) => (
								<li key={idx} className="flex items-start gap-3">
									<div className="mt-1 rounded-full bg-primary/10 p-0.5">
										<Check className="w-3 h-3 text-primary" />
									</div>
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
