import {
	queryOptions,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { UserFlag } from "@/types/api";

import type { Pagination, PaginationInput } from "@/types/common";

export type FlagsInput = PaginationInput & {
	status?: "pending" | "reviewed" | "dismissed";
	reported_user_id?: string;
};

export const getFlagsApi = (
	input?: FlagsInput,
): Promise<{
	data: UserFlag[];
	pagination: Pagination;
}> => {
	const params: Record<string, string> = {};

	if (input?.page) params.page = String(input.page);
	if (input?.limit) params.limit = String(input.limit);
	if (input?.status) params.status = input.status;
	if (input?.reported_user_id) params.reported_user_id = input.reported_user_id;

	return api.get("/flags", { params });
};

export const getFlagsQueryOptions = (input?: FlagsInput) => {
	return queryOptions({
		queryKey: ["flags", "list", input],
		queryFn: () => getFlagsApi(input),
	});
};

type UseFlagsOptions = {
	input?: FlagsInput;
	queryConfig?: QueryConfig<typeof getFlagsQueryOptions>;
};

export const useFlags = ({ input, queryConfig }: UseFlagsOptions = {}) => {
	return useQuery({
		...getFlagsQueryOptions(input),
		...queryConfig,
	});
};
