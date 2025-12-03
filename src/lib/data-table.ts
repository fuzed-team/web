import type { Column } from "@tanstack/react-table";
import { dataTableConfig } from "@/config/data-table";
import type {
	ExtendedColumnFilter,
	FilterOperator,
	FilterVariant,
} from "@/types/data-table";

export function getCommonPinningStyles<TData>({
	column,
	withBorder = false,
}: {
	column: Column<TData>;
	withBorder?: boolean;
}): React.CSSProperties {
	const isPinned = column.getIsPinned();
	const isLastLeftPinnedColumn =
		isPinned === "left" && column.getIsLastColumn("left");
	const isFirstRightPinnedColumn =
		isPinned === "right" && column.getIsFirstColumn("right");

	return {
		boxShadow: withBorder
			? isLastLeftPinnedColumn
				? "-4px 0 4px -4px var(--border) inset"
				: isFirstRightPinnedColumn
					? "4px 0 4px -4px var(--border) inset"
					: undefined
			: undefined,
		left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
		right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
		opacity: isPinned ? 0.97 : 1,
		position: isPinned ? "sticky" : "relative",
		background: isPinned ? "var(--background)" : "var(--background)",
		width: column.getSize(),
		zIndex: isPinned ? 1 : undefined,
	};
}

export function getFilterOperators(filterVariant: FilterVariant) {
	const operatorMap: Record<
		FilterVariant,
		{ label: string; value: FilterOperator }[]
	> = {
		text: dataTableConfig.textOperators,
		number: dataTableConfig.numericOperators,
		range: dataTableConfig.numericOperators,
		date: dataTableConfig.dateOperators,
		dateRange: dataTableConfig.dateOperators,
		boolean: dataTableConfig.booleanOperators,
		select: dataTableConfig.selectOperators,
		multiSelect: dataTableConfig.multiSelectOperators,
	};

	return operatorMap[filterVariant] ?? dataTableConfig.textOperators;
}

export function getDefaultFilterOperator(filterVariant: FilterVariant) {
	const operators = getFilterOperators(filterVariant);

	return operators[0]?.value ?? (filterVariant === "text" ? "iLike" : "eq");
}

export function getValidFilters<TData>(
	filters: ExtendedColumnFilter<TData>[],
): ExtendedColumnFilter<TData>[] {
	return filters.filter(
		(filter) =>
			filter.operator === "isEmpty" ||
			filter.operator === "isNotEmpty" ||
			(Array.isArray(filter.value)
				? filter.value.length > 0
				: filter.value !== "" &&
					filter.value !== null &&
					filter.value !== undefined),
	);
}

export function getValidQuery<T extends Record<string, any>>(
	query: T,
): Partial<T> {
	return Object.entries(query).reduce<Partial<T>>((acc, [key, value]) => {
		// Always include page and limit
		if (key === "page" || key === "limit") {
			acc[key as keyof T] = value as T[keyof T];
			return acc;
		}

		// Keep sort if it has at least one item
		if (key === "sort" && Array.isArray(value) && value.length > 0) {
			acc[key as keyof T] = value as T[keyof T];
			return acc;
		}

		// Skip empty strings
		if (value === "" || value === null || value === undefined) {
			return acc;
		}

		// Skip empty arrays
		if (Array.isArray(value) && value.length === 0) {
			return acc;
		}

		// Include all other valid values
		acc[key as keyof T] = value as T[keyof T];
		return acc;
	}, {});
}
