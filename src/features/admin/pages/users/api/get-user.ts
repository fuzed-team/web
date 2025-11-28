import { queryOptions, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import type { UserApi } from "@/types/api";

export const getUserApi = (id: string): Promise<UserApi> => {
	return apiClient.get(`/users/${id}`);
};

export const getUserQueryOptions = (id: string) => {
	return queryOptions({
		queryKey: ["users", id],
		queryFn: () => getUserApi(id),
	});
};

type UseUserOptions = {
	input: string;
	queryConfig?: QueryConfig<typeof getUserQueryOptions>;
};

export const useUser = ({ input, queryConfig }: UseUserOptions) => {
	return useQuery({
		...getUserQueryOptions(input),
		...queryConfig,
	});
};
