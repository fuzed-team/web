import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export type UserStats = {
	role: Record<string, number>;
	status: Record<string, number>;
};

export const getUserStatsApi = (): Promise<UserStats> => {
	return api.get("/admin/users/stats");
};

export const getUserStatsQueryOptions = () => {
	return queryOptions({
		queryKey: ["users", "stats"],
		queryFn: () => getUserStatsApi(),
	});
};

type UseUserStatsOptions = {
	queryConfig?: QueryConfig<typeof getUserStatsQueryOptions>;
};

export const useUserStats = ({ queryConfig }: UseUserStatsOptions = {}) => {
	return useQuery({
		...getUserStatsQueryOptions(),
		...queryConfig,
	});
};
