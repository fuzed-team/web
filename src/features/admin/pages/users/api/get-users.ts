import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { UserApi, UserRole } from "@/types/api";
import type { Pagination, PaginationInput } from "@/types/common";

export type UsersInput = PaginationInput & {
	name?: string;
	role?: UserRole[];
	status?: string[];
	createdAtFrom?: string;
	createdAtTo?: string;
};

export const getUsersApi = (
	input?: UsersInput,
): Promise<{
	data: UserApi[];
	pagination: Pagination;
}> => {
	const params: Record<string, string> = {};

	if (input?.page) params.page = String(input.page);
	if (input?.limit) params.limit = String(input.limit);
	if (input?.name) params.name = input.name;
	if (input?.role?.length) params.role = input.role.join(",");
	if (input?.status?.length) params.status = input.status.join(",");
	if (input?.sort) params.sort = input.sort;
	if (input?.createdAtFrom) params.createdAtFrom = input.createdAtFrom;
	if (input?.createdAtTo) params.createdAtTo = input.createdAtTo;

	return api.get("/admin/users", { params });
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
