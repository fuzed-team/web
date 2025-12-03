import { useQueryStates } from "nuqs";
import { parseAsInteger, parseAsStringEnum } from "nuqs/server";
import { getValidQuery } from "@/lib/data-table";
import { USER_FLAG_STATUSES } from "@/types/api";
import type { FlagsInput } from "../api/get-flags";

// Export parsers for client-side use with useQueryStates
export const searchParamsParsers = {
	page: parseAsInteger.withDefault(1),
	limit: parseAsInteger.withDefault(10),
	status: parseAsStringEnum(USER_FLAG_STATUSES),
};

export function useFlagsSearchParams() {
	const [urlParams] = useQueryStates(searchParamsParsers);
	const validQuery = getValidQuery(urlParams);
	return validQuery as FlagsInput;
}
