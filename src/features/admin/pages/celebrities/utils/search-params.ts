import { useQueryStates } from "nuqs";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	parseAsStringEnum,
} from "nuqs/server";
import { getValidQuery } from "@/lib/data-table";
import { getSortingStateParser } from "@/lib/parsers";
import type { CelebritiesInput, CelebrityApi } from "../api/get-celebrities";

const CELEBRITY_CATEGORIES = [
	"actors",
	"musicians",
	"athletes",
	"directors",
	"others",
];

const CELEBRITY_GENDERS = ["male", "female"];

// Export parsers for client-side use with useQueryStates
export const searchParamsParsers = {
	page: parseAsInteger.withDefault(1),
	limit: parseAsInteger.withDefault(10),
	sort: getSortingStateParser<CelebrityApi>().withDefault([
		{ id: "created_at", desc: true },
	]),
	name: parseAsString.withDefault(""),
	category: parseAsArrayOf(parseAsStringEnum(CELEBRITY_CATEGORIES)).withDefault(
		[],
	),
	gender: parseAsArrayOf(parseAsStringEnum(CELEBRITY_GENDERS)).withDefault([]),
	is_featured: parseAsString.withDefault(""),
};

export function useCelebritiesSearchParams() {
	const [urlParams] = useQueryStates(searchParamsParsers);
	const validQuery = getValidQuery(urlParams);
	return validQuery as CelebritiesInput;
}
