import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { LiveMatchApi } from "@/types/api";
import { transformApiMatchesToDisplayData } from "../utils/transform-api-data";

export type LiveMatchInput = {
	limit: number;
	offset: number;
};

export const getLiveMatchApi = (
	input: LiveMatchInput,
): Promise<LiveMatchApi[]> => {
	return apiClient.get("/api/v1/matches/top", {
		params: { ...input, filter: "user" },
	});
};

export const getLiveMatchQueryOptions = (input: LiveMatchInput) => {
	return queryOptions({
		queryKey: ["matching", "top", input],
		queryFn: () => getLiveMatchApi(input),
	});
};

type UseLiveMatchOptions = {
	queryConfig?: QueryConfig<typeof getLiveMatchQueryOptions>;
	input?: LiveMatchInput;
};

export const useLiveMatch = ({
	input = {
		offset: PAGINATION.DEFAULT_OFFSET,
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
		offset: PAGINATION.DEFAULT_OFFSET,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
	queryConfig,
}: UseLiveMatchInfiniteOptions = {}) => {
	return useInfiniteQuery({
		queryKey: ["matching", "top", "infinite", input],
		queryFn: ({ pageParam = PAGINATION.DEFAULT_OFFSET }) =>
			getLiveMatchApi({
				...input,
				offset: pageParam,
			}),
		getNextPageParam: (lastPage, _, lastPageParam) => {
			if (lastPage.length === 0) {
				return undefined;
			}
			return lastPageParam + input.limit;
		},
		initialPageParam: PAGINATION.DEFAULT_OFFSET,
		select: (data) => {
			return data.pages.flatMap((page) => {
				console.log("🚀 ~ useLiveMatchInfinite ~ page:", page);
				console.log(
					"🚀 ~ useLiveMatchInfinite ~ page:",
					transformApiMatchesToDisplayData(page),
				);
				return transformApiMatchesToDisplayData(page);
			});
		},
		...queryConfig,
	});
};
