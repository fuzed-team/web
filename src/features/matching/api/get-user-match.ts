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

export type UserMatchInput = {
	faceId: string;
	limit: number;
	skip: number;
	reaction?: Reaction;
	signal?: AbortSignal;
};

export const getUserMatchApi = async (
	input: UserMatchInput,
): Promise<UserMatchApi[]> => {
	const { signal, skip, faceId, limit } = input;

	const response = await api.get<{ matches: UserMatchApi[]; total: number }>(
		"/matches/for-image",
		{
			params: {
				face_id: faceId,
				skip: skip,
				limit: limit,
			},
			signal,
		},
	);
	return response.matches;
};

export const getUserMatchQueryOptions = (input: UserMatchInput) => {
	return queryOptions({
		queryKey: ["matching", "user", input],
		queryFn: ({ signal }) => getUserMatchApi({ ...input, signal }),
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
		UserMatchApi[],
		Error,
		ReturnType<typeof transformApiUserMatchesToDisplayData>,
		string[],
		number
	>({
		queryKey: ["matching", "user", "infinite", input.faceId],
		queryFn: ({ pageParam, signal }) =>
			getUserMatchApi({
				...input,
				skip: pageParam,
				signal,
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
				return transformApiUserMatchesToDisplayData(page);
			});
		},
		...queryConfig,
	});
};
