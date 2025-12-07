import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export interface StatCardProps {
	label: string;
	value: number | string;
	subtitle?: string;
	trend?: string;
	trendUp?: boolean;
}

export const StatCard = ({
	label,
	value,
	subtitle,
	trend,
	trendUp,
}: StatCardProps) => (
	<motion.div
		className="p-4 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
		initial={{ opacity: 0, y: 10 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.3 }}
	>
		<div className="text-xs text-muted-foreground mb-1">{label}</div>
		<div className="text-2xl font-semibold tracking-tight text-foreground">
			{typeof value === "number" ? value.toLocaleString() : value}
		</div>
		{trend && (
			<div
				className={`text-[10px] font-medium flex items-center gap-1 mt-1 ${trendUp ? "text-green-600" : "text-muted-foreground"}`}
			>
				{trendUp && <TrendingUp className="w-3 h-3" />}
				{trend}
			</div>
		)}
		{subtitle && !trend && (
			<div className="text-[10px] text-muted-foreground mt-1">{subtitle}</div>
		)}
	</motion.div>
);
