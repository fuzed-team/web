import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import qs from "qs";
import { api } from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { UserApi, UserRole, UserStatus } from "@/types/api";
import type { Pagination, PaginationInput } from "@/types/common";
export type UsersInput = PaginationInput & {
	name?: string;
	role?: UserRole[];
	status?: UserStatus[];
	createdAt?: string;
};

export const getUsersApi = (
	input?: UsersInput,
): Promise<{
	data: UserApi[];
	pagination: Pagination;
}> => {
	const transformedInput = input?.sort
		? {
				...input,
				sort: input.sort.map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`),
			}
		: input;

	const params = qs.stringify(transformedInput, { arrayFormat: "comma" });
	return api.get(`/admin/users?${params}`);
};

export const getUsersQueryOptions = (
	input: UsersInput = {
		page: PAGINATION.DEFAULT_PAGE,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
) => {
	return queryOptions({
		queryKey: ["users", "list", input],
		queryFn: () => getUsersApi(input),
	});
};

type UseUsersOptions = {
	input?: UsersInput;
	queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({
	input = {
		page: PAGINATION.DEFAULT_PAGE,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
	queryConfig,
}: UseUsersOptions = {}) => {
	return useQuery({
		...getUsersQueryOptions(input),
		...queryConfig,
	});
};

type UseUsersInfiniteOptions = {
	input?: UsersInput;
	queryConfig?: QueryConfig<any>;
};

export const useUsersInfinite = ({
	input = {
		page: PAGINATION.DEFAULT_PAGE,
		limit: PAGINATION.DEFAULT_PAGE,
	},
	queryConfig,
}: UseUsersInfiniteOptions = {}) => {
	return useInfiniteQuery({
		queryKey: ["users", "infinite", input],
		queryFn: ({ pageParam = 1 }) =>
			getUsersApi({
				...input,
				page: pageParam,
			}),
		getNextPageParam: (lastPage, _, lastPageParam) => {
			if (lastPage.data.length === 0) {
				return undefined;
			}
			return lastPageParam + 1;
		},
		initialPageParam: 1,
		select: (data) => {
			return data.pages.flatMap((page) => page.data);
		},
		...queryConfig,
	});
};
