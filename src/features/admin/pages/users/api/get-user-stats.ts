import { queryOptions, useQuery } from "@tanstack/react-query";
import qs from "qs";
import apiClient from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import type {
	Department,
	EmploymentType,
	JobRole,
	UserRole,
	UserStats,
	UserStatus,
} from "@/types/api";

export type UserStatsInput = {
	name?: string;
	jobRole?: JobRole[];
	employmentType?: EmploymentType[];
	department?: Department[];
	role?: UserRole[];
	status?: UserStatus;
	createdAtFrom?: string;
	createdAtTo?: string;
};

export const getUserStatsApi = (input?: UserStatsInput): Promise<UserStats> => {
	return apiClient.get("/users/stats", {
		params: input,
		paramsSerializer: (params) =>
			qs.stringify(params, { arrayFormat: "repeat" }),
	});
};

export const getUserStatsQueryOptions = (input: UserStatsInput) => {
	return queryOptions({
		queryKey: ["users", "stats", input],
		queryFn: () => getUserStatsApi(input),
	});
};

type UseUserStatsOptions = {
	input?: UserStatsInput;
	queryConfig?: QueryConfig<typeof getUserStatsQueryOptions>;
};

export const useUserStats = ({ input, queryConfig }: UseUserStatsOptions) => {
	return useQuery({
		...getUserStatsQueryOptions(input ?? {}),
		...queryConfig,
	});
};
