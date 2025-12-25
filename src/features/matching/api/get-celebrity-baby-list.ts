import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import api from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";

// Types
export type CelebrityBabyListItem = {
	id: string; // celebrity_match_id
	me: {
		id: string;
		name: string;
		image: string;
	};
	celebrity: {
		id: string;
		name: string;
		image: string;
		category?: string;
	};
	created_at: string;
	images: Array<{
		id: string;
		image_url: string;
	}>;
};

export type GetCelebrityBabyListInput = {
	userId?: string;
	skip?: number;
	limit?: number;
};

type CelebrityBabyListResponse = {
	babies: CelebrityBabyListItem[];
	total: number;
	skip: number;
	limit: number;
};

// API Function
export const getCelebrityBabyListApi = async (
	input: GetCelebrityBabyListInput = {},
	signal?: AbortSignal,
): Promise<CelebrityBabyListResponse> => {
	const response = await api.get<CelebrityBabyListResponse>(
		"/baby/celebrity/list",
		{ params: input, signal },
	);
	return response;
};

// Query Options
export const getCelebrityBabyListQueryOptions = (
	input: GetCelebrityBabyListInput = {},
) => {
	return queryOptions({
		queryKey: ["baby", "celebrity", "list", input],
		queryFn: ({ signal }) => getCelebrityBabyListApi(input, signal),
	});
};

// Hooks
type UseCelebrityBabyListOptions = {
	input?: GetCelebrityBabyListInput;
	queryConfig?: QueryConfig<typeof getCelebrityBabyListQueryOptions>;
};

export const useCelebrityBabyList = ({
	input = {},
	queryConfig,
}: UseCelebrityBabyListOptions = {}) => {
	return useQuery({
		...getCelebrityBabyListQueryOptions(input),
		...queryConfig,
	});
};

// Infinite Query Hook
type UseCelebrityBabyListInfiniteOptions = {
	input?: GetCelebrityBabyListInput;
};

export const useCelebrityBabyListInfinite = ({
	input = { skip: PAGINATION.DEFAULT_OFFSET, limit: PAGINATION.DEFAULT_LIMIT },
}: UseCelebrityBabyListInfiniteOptions = {}) => {
	return useInfiniteQuery({
		queryKey: ["baby", "celebrity", "list", "infinite"],
		queryFn: ({ pageParam = PAGINATION.DEFAULT_OFFSET, signal }) =>
			getCelebrityBabyListApi(
				{
					...input,
					skip: pageParam,
				},
				signal,
			),
		getNextPageParam: (lastPage, _, lastPageParam) => {
			const limit = input.limit ?? PAGINATION.DEFAULT_LIMIT;
			const nextSkip = lastPageParam + limit;
			// Stop fetching if we've already loaded all items
			if (lastPage.babies.length === 0 || nextSkip >= lastPage.total) {
				return undefined;
			}
			return nextSkip;
		},
		initialPageParam: PAGINATION.DEFAULT_OFFSET,
		select: (data) => ({
			items: data.pages.flatMap((page) => page.babies),
			total: data.pages[0]?.total ?? 0,
		}),
	});
};
