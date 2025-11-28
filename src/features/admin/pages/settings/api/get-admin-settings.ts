import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

/**
 * Type definitions for system settings
 */
export type MatchingWeights = {
	embedding: number;
	geometry: number;
	age: number;
	symmetry: number;
	skin_tone: number;
	expression: number;
};

export type SystemSettings = {
	matching_weights: MatchingWeights;
	allow_non_edu_emails: boolean;
	match_threshold: number;
	daily_baby_generation_limit: number;
	daily_photo_upload_limit: number;
};

export const getAdminSettingsApi = (): Promise<SystemSettings> => {
	return api
		.get<{ data: SystemSettings }>("/admin/settings")
		.then((res) => res.data);
};

export const getAdminSettingsQueryOptions = () => {
	return queryOptions({
		queryKey: ["admin", "settings"],
		queryFn: getAdminSettingsApi,
	});
};

type UseAdminSettingsOptions = {
	queryConfig?: QueryConfig<typeof getAdminSettingsQueryOptions>;
};

export const useAdminSettings = ({
	queryConfig,
}: UseAdminSettingsOptions = {}) => {
	return useQuery({
		...getAdminSettingsQueryOptions(),
		...queryConfig,
	});
};
