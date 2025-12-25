import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import api from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { LiveMatchApi } from "@/types/api";
import { transformApiMatchesToDisplayData } from "../utils/transform-api-data";

export type LiveMatchInput = {
	limit: number;
	skip: number;
	signal?: AbortSignal;
};

type LiveMatchResponse = {
	matches: LiveMatchApi[];
	total: number;
};

export const getLiveMatchApi = async (
	input: LiveMatchInput,
): Promise<LiveMatchResponse> => {
	const { signal, ...query } = input;
	const response = await api.get<LiveMatchResponse>(
		"/matches/top",
		{
			params: query,
			signal,
		},
	);
	return response;
};

export const getLiveMatchQueryOptions = (input: LiveMatchInput) => {
	return queryOptions({
		queryKey: ["matching", "top", input],
		queryFn: async () => {
			const response = await getLiveMatchApi(input);
			return response.matches;
		},
	});
};

type UseLiveMatchOptions = {
	queryConfig?: QueryConfig<typeof getLiveMatchQueryOptions>;
	input?: LiveMatchInput;
};

export const useLiveMatch = ({
	input = {
		skip: PAGINATION.DEFAULT_OFFSET,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
	queryConfig,
}: UseLiveMatchOptions = {}) => {
	return useQuery({
		...getLiveMatchQueryOptions(input),
		...queryConfig,
	});
};

type UseLiveMatchInfiniteOptions = {
	input?: LiveMatchInput;
	queryConfig?: QueryConfig<typeof getLiveMatchApi>;
};

export const useLiveMatchInfinite = ({
	input = {
		skip: PAGINATION.DEFAULT_OFFSET,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
	queryConfig,
}: UseLiveMatchInfiniteOptions = {}) => {
	return useInfiniteQuery({
		queryKey: ["matching", "top", "infinite"],
		queryFn: ({ pageParam = PAGINATION.DEFAULT_OFFSET, signal }) =>
			getLiveMatchApi({
				...input,
				skip: pageParam,
				signal,
			}),
		getNextPageParam: (lastPage, _, lastPageParam) => {
			const nextSkip = lastPageParam + input.limit;
			// Stop fetching if we've already loaded all items
			if (lastPage.matches.length === 0 || nextSkip >= lastPage.total) {
				return undefined;
			}
			return nextSkip;
		},
		initialPageParam: PAGINATION.DEFAULT_OFFSET,
		select: (data) => {
			return data.pages.flatMap((page) => {
				return transformApiMatchesToDisplayData(page.matches);
			});
		},
		...queryConfig,
	});
};
