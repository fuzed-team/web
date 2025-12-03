import { useQueryStates } from "nuqs";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
} from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";
import { USER_ROLES, USER_STATUSES, type UserApi } from "@/types/api";
import type { UsersInput } from "../api/get-users";

// Export parsers for client-side use with useQueryStates
export const searchParamsParsers = {
	page: parseAsInteger.withDefault(1),
	limit: parseAsInteger.withDefault(10),
	sort: getSortingStateParser<UserApi>().withDefault([
		{ id: "createdAt", desc: true },
	]),
	name: parseAsString.withDefault(""),
	role: parseAsArrayOf(parseAsStringEnum(USER_ROLES)).withDefault([]),
	status: parseAsArrayOf(parseAsStringEnum(USER_STATUSES)).withDefault([]),
	createdAt: parseAsString.withDefault(""),
};

export function useUsersSearchParams() {
	const [urlParams] = useQueryStates(searchParamsParsers);
	return urlParams as UsersInput;
}
