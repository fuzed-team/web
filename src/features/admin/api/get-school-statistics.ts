import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export interface SchoolStatistics {
	school: string;
	total_users: number;
	active_users_7d: number;
	total_matches: number;
	avg_matches_per_user: number;
}

export interface SchoolStatisticsResponse {
	schools: SchoolStatistics[];
	total_schools: number;
}

/**
 * Fetches school statistics (admin only)
 */
export const getSchoolStatisticsApi =
	async (): Promise<SchoolStatisticsResponse> => {
		return api.get<SchoolStatisticsResponse>("/admin/schools");
	};

export const getSchoolStatisticsQueryOptions = () => {
	return queryOptions({
		queryKey: ["admin", "schools", "statistics"],
		queryFn: () => getSchoolStatisticsApi(),
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

type UseSchoolStatisticsOptions = {
	queryConfig?: QueryConfig<typeof getSchoolStatisticsQueryOptions>;
};

export const useSchoolStatistics = ({
	queryConfig,
}: UseSchoolStatisticsOptions = {}) => {
	return useQuery({
		...getSchoolStatisticsQueryOptions(),
		...queryConfig,
	});
};
