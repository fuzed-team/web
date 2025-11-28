"use client";

import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import type { DataTableFilterField } from "@/types/common";

interface UseDataTableProps<TData, TValue> {
	/**
	 * The data for the table.
	 * @default []
	 * @type TData[]
	 */
	data: TData[];

	/**
	 * The columns of the table.
	 * @default []
	 * @type ColumnDef<TData, TValue>[]
	 */
	columns: ColumnDef<TData, TValue>[];

	/**
	 * The number of total rows in the table.
	 * @type number
	 */
	rowCount: number;

	/**
	 * Defines filter fields for the table. Supports both dynamic faceted filters and search filters.
	 * - Faceted filters are rendered when `options` are provided for a filter field.
	 * - Otherwise, search filters are rendered.
	 *
	 * The indie filter field `value` represents the corresponding column name in the database table.
	 * @default []
	 * @type { label: string, value: keyof TData, placeholder?: string, options?: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[] }[]
	 * @example
	 * ```ts
	 * // Render a search filter
	 * const filterFields = [
	 *   { label: "Title", value: "title", placeholder: "Search titles" }
	 * ];
	 * // Render a faceted filter
	 * const filterFields = [
	 *   {
	 *     label: "Status",
	 *     value: "status",
	 *     options: [
	 *       { label: "Todo", value: "todo" },
	 *       { label: "In Progress", value: "in-progress" },
	 *       { label: "Done", value: "done" },
	 *       { label: "Canceled", value: "canceled" }
	 *     ]
	 *   }
	 * ];
	 * ```
	 */
	filterFields?: DataTableFilterField<TData>[];

	/**
	 * Enable notion like column filters.
	 * Advanced filters and column filters cannot be used at the same time.
	 * @default false
	 * @type boolean
	 */
	enableAdvancedFilter?: boolean;

	/**
	 * Whether the data is loading.
	 * @type boolean
	 */
	isLoading: boolean;
}

export function useDataTable<TData, TValue>({
	isLoading,
	data,
	columns,
	rowCount,
	filterFields = [],
	enableAdvancedFilter = false,
}: UseDataTableProps<TData, TValue>) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Search params
	const page = searchParams?.get("page")
		? Number(searchParams?.get("page"))
		: 1;
	const limit = searchParams?.get("limit")
		? Number(searchParams?.get("limit"))
		: 10;
	const sort = searchParams?.get("sort") ?? null;
	const [column, order] = sort?.split(".") ?? [];

	// Memoize computation of searchableColumns and filterableColumns
	const { searchableColumns, filterableColumns } = React.useMemo(() => {
		return {
			searchableColumns: filterFields.filter((field) => !field.options),
			filterableColumns: filterFields.filter((field) => field.options),
		};
	}, [filterFields]);

	// Create query string
	const createQueryString = React.useCallback(
		(params: Record<string, string | number | null | undefined>) => {
			const newSearchParams = new URLSearchParams(searchParams?.toString());

			for (const [key, value] of Object.entries(params)) {
				if (value === null || value === undefined) {
					newSearchParams.delete(key);
				} else {
					newSearchParams.set(key, String(value));
				}
			}

			return newSearchParams.toString();
		},
		[searchParams],
	);

	// Initial column filters
	const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
		const filters: ColumnFiltersState = [];
		Array.from(searchParams?.entries() || []).forEach(([key, value]) => {
			const filterableColumn = filterableColumns.find(
				(column) => column.value === key,
			);
			const searchableColumn = searchableColumns.find(
				(column) => column.value === key,
			);

			if (filterableColumn) {
				filters.push({
					id: key,
					value: value.split(","),
				});
			} else if (searchableColumn) {
				filters.push({
					id: key,
					value: value,
				});
			}
		});

		return filters;
	}, [filterableColumns, searchableColumns, searchParams]);

	// Table states
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>(initialColumnFilters);

	// Handle server-side pagination
	const [{ pageIndex, pageSize }, setPagination] =
		React.useState<PaginationState>({
			pageIndex: page - 1,
			pageSize: limit,
		});

	const pagination = React.useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize],
	);

	React.useEffect(() => {
		router.push(
			`${pathname}?${createQueryString({
				page: pageIndex + 1,
				limit: pageSize,
			})}`,
			{
				scroll: false,
			},
		);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageIndex, pageSize]);

	// Handle server-side sorting
	const [sorting, setSorting] = React.useState<SortingState>([
		{
			id: column ?? "",
			desc: order === "desc",
		},
	]);

	React.useEffect(() => {
		router.push(
			`${pathname}?${createQueryString({
				sort: sorting[0]?.id
					? `${sorting[0]?.id}.${sorting[0]?.desc ? "desc" : "asc"}`
					: null,
			})}`,
		);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sorting]);

	// Handle server-side filtering
	const debouncedSearchableColumnFilters = JSON.parse(
		useDebounce(
			JSON.stringify(
				columnFilters.filter((filter) => {
					return searchableColumns.find((column) => column.value === filter.id);
				}),
			),
			500,
		),
	) as ColumnFiltersState;

	const filterableColumnFilters = columnFilters.filter((filter) => {
		return filterableColumns.find((column) => {
			return column.value === filter.id;
		});
	});

	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		// Opt out when advanced filter is enabled, because it contains additional params
		if (enableAdvancedFilter) return;

		// Prevent resetting the page on initial render
		if (!mounted) {
			setMounted(true);
			return;
		}

		// Initialize new params
		const newParamsObject = {
			page: 1,
		};

		// Handle debounced searchable column filters
		for (const column of debouncedSearchableColumnFilters) {
			if (typeof column.value === "string") {
				Object.assign(newParamsObject, {
					[column.id]:
						typeof column.value === "string" ? column.value : undefined,
				});
			}
		}

		// Handle filterable column filters
		for (const column of filterableColumnFilters) {
			if (
				(typeof column.value === "object" && Array.isArray(column.value)) ||
				typeof column.value === "string"
			) {
				Object.assign(newParamsObject, { [column.id]: column.value });
			}
		}

		// Remove deleted values
		for (const [key] of searchParams?.entries() || []) {
			if (
				(searchableColumns.find((column) => column.value === key) &&
					!debouncedSearchableColumnFilters.find(
						(column) => column.id === key,
					)) ||
				(filterableColumns.find((column) => column.value === key) &&
					!filterableColumnFilters.find((column) => column.id === key))
			) {
				Object.assign(newParamsObject, { [key]: null });
			}
		}

		// After cumulating all the changes, push new params
		router.push(`${pathname}?${createQueryString(newParamsObject)}`);

		table.setPageIndex(0);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// eslint-disable-next-line react-hooks/exhaustive-deps
		JSON.stringify(debouncedSearchableColumnFilters),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		JSON.stringify(filterableColumnFilters),
	]);

	// Show loading skeleton
	const tableData = React.useMemo(
		() => (isLoading ? Array(limit).fill({}) : data),
		[isLoading, data, limit],
	);
	const tableColumns = React.useMemo(
		() =>
			isLoading
				? columns.map((column) => ({
						...column,
						cell: () => <Skeleton className="h-8 w-full" />,
					}))
				: columns,
		[isLoading, columns],
	);

	const table = useReactTable({
		data: tableData,
		columns: tableColumns,
		rowCount: rowCount ?? -1,
		state: {
			pagination,
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
	});

	return { table };
}
