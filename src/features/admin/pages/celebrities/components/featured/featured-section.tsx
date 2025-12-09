"use client";

import { CalendarHeart } from "lucide-react";
import { useFeaturedCelebrities } from "../../api/get-featured-celebrities";
import { getTimeLeft } from "../../utils/celebrity-helpers";
import { FeaturedCard } from "./featured-card";

export function FeaturedSection() {
	const { data, isLoading } = useFeaturedCelebrities();

	// Calculate refresh time (time until midnight or next refresh)
	const getRefreshTime = () => {
		if (data?.male?.featured_until) {
			return getTimeLeft(data.male.featured_until).replace(" left", "");
		}
		if (data?.female?.featured_until) {
			return getTimeLeft(data.female.featured_until).replace(" left", "");
		}
		return "24:00:00";
	};

	return (
		<div className="fade-in">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-medium text-foreground flex items-center gap-2">
					<CalendarHeart className="size-4 text-primary" />
					Today's Featured Pair
				</h3>
				<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
					Refreshes in {getRefreshTime()}
				</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<FeaturedCard
					celebrity={data?.male || null}
					gender="male"
					isLoading={isLoading}
				/>
				<FeaturedCard
					celebrity={data?.female || null}
					gender="female"
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}
