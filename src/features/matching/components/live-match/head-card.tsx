import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface HeadCardProps {
	stats: {
		activeUsers: number;
		newMatches: number;
		viewedMatches: number;
	};
	onFilterChange: (filter: "all" | "new" | "viewed") => void;
	activeFilter: "all" | "new" | "viewed";
}

export const HeadCard = ({
	stats,
	onFilterChange,
	activeFilter,
}: HeadCardProps) => {
	const { activeUsers, newMatches, viewedMatches } = stats;
	return (
		<Card className="p-4 bg-gradient-primary text-white border-0 shadow-match gap-0 rounded-2xl">
			<div className="flex items-center gap-2 mb-2">
				<Flame className="w-5 h-5" />
				<h3 className="font-semibold">Live Matches</h3>
			</div>

			<p className="text-sm text-white/90 mb-3">
				🔥 {activeUsers} people getting matched right now
			</p>

			<div className="flex gap-2">
				<Badge
					variant="secondary"
					className={`rounded-full cursor-pointer transition-all duration-200 ${
						activeFilter === "all"
							? "bg-white text-primary shadow-lg"
							: "bg-white/20 text-white border-transparent hover:bg-white/30"
					}`}
					onClick={() => onFilterChange("all")}
				>
					🔥 All ({newMatches + viewedMatches})
				</Badge>
				<Badge
					variant="secondary"
					className={`rounded-full cursor-pointer transition-all duration-200 ${
						activeFilter === "new"
							? "bg-white text-primary shadow-lg"
							: "bg-white/20 text-white border-transparent hover:bg-white/30"
					}`}
					onClick={() => onFilterChange("new")}
				>
					😍 New ({newMatches})
				</Badge>
				<Badge
					variant="outline"
					className={`rounded-full cursor-pointer transition-all duration-200 ${
						activeFilter === "viewed"
							? "bg-white text-primary border-white shadow-lg"
							: "bg-transparent text-white border-white/30 hover:bg-white/10"
					}`}
					onClick={() => onFilterChange("viewed")}
				>
					👀 Viewed ({viewedMatches})
				</Badge>
			</div>
		</Card>
	);
};
