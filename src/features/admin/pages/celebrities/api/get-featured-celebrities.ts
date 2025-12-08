import { queryOptions, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CelebrityApi } from "./get-celebrities";

export type FeaturedCelebrities = {
	male: CelebrityApi | null;
	female: CelebrityApi | null;
};

export async function fetchFeaturedCelebrities(): Promise<FeaturedCelebrities> {
	const supabase = createClient();

	const { data: featured, error } = await supabase
		.from("celebrities")
		.select("*")
		.eq("is_featured", true)
		.gte("featured_until", new Date().toISOString());

	if (error) throw error;

	const male = featured?.find((c) => c.gender === "male") || null;
	const female = featured?.find((c) => c.gender === "female") || null;

	return { male, female };
}

export const getFeaturedCelebritiesQueryOptions = () => {
	return queryOptions({
		queryKey: ["admin-featured-celebrities"],
		queryFn: fetchFeaturedCelebrities,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};

export const useFeaturedCelebrities = () => {
	return useQuery(getFeaturedCelebritiesQueryOptions());
};
