import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import api from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { Reaction, UserMatchApi } from "@/types/api";
import { transformApiUserMatchesToDisplayData } from "../utils/transform-api-data";

export type SortByOption =
	| "highest_percentage"
	| "lowest_percentage"
	| "newest"
	| "oldest";

export type UserMatchInput = {
	faceId: string;
	limit: number;
	skip: number;
	sortBy?: SortByOption;
	reaction?: Reaction;
	signal?: AbortSignal;
};

type UserMatchResponse = {
	matches: UserMatchApi[];
	total: number;
};

export const getUserMatchApi = async (
	input: UserMatchInput,
): Promise<UserMatchResponse> => {
	const { signal, skip, faceId, limit, sortBy } = input;

	const response = await api.get<UserMatchResponse>(
		"/matches/for-image",
		{
			params: {
				face_id: faceId,
				skip: skip,
				limit: limit,
				sort_by: sortBy,
			},
			signal,
		},
	);
	return response;
};

export const getUserMatchQueryOptions = (input: UserMatchInput) => {
	return queryOptions({
		queryKey: ["matching", "user", input],
		queryFn: async ({ signal }) => {
			const response = await getUserMatchApi({ ...input, signal });
			return response.matches;
		},
	});
};

type UseUserMatchOptions = {
	queryConfig?: QueryConfig<typeof getUserMatchQueryOptions>;
	input: UserMatchInput;
};

export const useUserMatch = ({ input, queryConfig }: UseUserMatchOptions) => {
	return useQuery({
		...getUserMatchQueryOptions(input),
		...queryConfig,
		select: (data) => transformApiUserMatchesToDisplayData(data),
	});
};

type UseUserMatchInfiniteOptions = {
	input: Omit<UserMatchInput, "skip">;
	queryConfig?: any;
};

export const useUserMatchInfinite = ({
	input,
	queryConfig,
}: UseUserMatchInfiniteOptions) => {
	return useInfiniteQuery<
		UserMatchResponse,
		Error,
		ReturnType<typeof transformApiUserMatchesToDisplayData>,
		string[],
		number
	>({
		queryKey: ["matching", "user", "infinite", input.faceId, input.sortBy],
		queryFn: ({ pageParam, signal }) =>
			getUserMatchApi({
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
				return transformApiUserMatchesToDisplayData(page.matches);
			});
		},
		...queryConfig,
	});
};
