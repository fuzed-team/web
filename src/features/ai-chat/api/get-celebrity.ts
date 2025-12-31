import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import type { AICelebrity } from "../types";

export const getCelebrityApi = async (
	id: string,
	signal?: AbortSignal,
): Promise<AICelebrity> => {
	return api.get<AICelebrity>(`/matches/celebrity/${id}`, {
		signal,
	});
};

export const getCelebrityQueryOptions = (id: string) => {
	return queryOptions({
		queryKey: ["celebrity", id],
		queryFn: ({ signal }) => getCelebrityApi(id, signal),
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
};

type UseCelebrityOptions = {
	id: string;
	queryConfig?: QueryConfig<typeof getCelebrityQueryOptions>;
};

export const useCelebrity = ({ id, queryConfig }: UseCelebrityOptions) => {
	return useQuery({
		...getCelebrityQueryOptions(id),
		...queryConfig,
		enabled: !!id,
	});
};
