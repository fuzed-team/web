import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export interface QuotaItem {
	current: number;
	limit: number;
	allowed: boolean;
	reset_at: string;
}

export interface UserQuotaResponse {
	baby_generations: QuotaItem;
	photo_uploads: QuotaItem;
}

export const getUserQuotaApi = async (): Promise<UserQuotaResponse> => {
	return await api.get<UserQuotaResponse>("/quota");
};

export const getUserQuotaQueryOptions = () => {
	return queryOptions({
		queryKey: ["user-quota"],
		queryFn: () => getUserQuotaApi(),
		staleTime: 30 * 1000, // 30 seconds
	});
};

type UseUserQuotaOptions = {
	queryConfig?: QueryConfig<typeof getUserQuotaQueryOptions>;
};

export const useUserQuota = ({ queryConfig }: UseUserQuotaOptions = {}) => {
	return useQuery({
		...getUserQuotaQueryOptions(),
		...queryConfig,
	});
};
