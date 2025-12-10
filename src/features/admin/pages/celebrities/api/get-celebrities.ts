import { queryOptions, useQuery } from "@tanstack/react-query";
import qs from "qs";
import api from "@/lib/api-client";
import { PAGINATION } from "@/lib/constants/constant";
import type { QueryConfig } from "@/lib/react-query";
import type { Pagination, PaginationInput } from "@/types/common";
import type { Database } from "@/types/database.types";

export type CelebrityApi = Database["public"]["Tables"]["celebrities"]["Row"];

export type CelebritiesInput = PaginationInput & {
	name?: string;
	category?: string[];
	gender?: string[];
	is_featured?: boolean;
};

export const getCelebritiesApi = (
	input?: CelebritiesInput,
): Promise<{
	data: CelebrityApi[];
	pagination: Pagination;
}> => {
	const transformedInput = input?.sort
		? {
				...input,
				sort: input.sort.map((s) => `${s.id}.${s.desc ? "desc" : "asc"}`),
			}
		: input;

	const params = qs.stringify(transformedInput, { arrayFormat: "comma" });
	return api.get(`/admin/celebrities?${params}`);
};

export const getCelebritiesQueryOptions = (
	input: CelebritiesInput = {
		page: PAGINATION.DEFAULT_PAGE,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
) => {
	return queryOptions({
		queryKey: ["celebrities", "list", input],
		queryFn: () => getCelebritiesApi(input),
	});
};

type UseCelebritiesOptions = {
	input?: CelebritiesInput;
	queryConfig?: QueryConfig<typeof getCelebritiesQueryOptions>;
};

export const useCelebrities = ({
	input = {
		page: PAGINATION.DEFAULT_PAGE,
		limit: PAGINATION.DEFAULT_LIMIT,
	},
	queryConfig,
}: UseCelebritiesOptions = {}) => {
	return useQuery({
		...getCelebritiesQueryOptions(input),
		...queryConfig,
	});
};
