"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FlagsTableToolbarProps<TData> {
	table: Table<TData>;
}

export function FlagsTableToolbar<TData>({
	table,
}: FlagsTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	const statusOptions = [
		{ label: "Pending", value: "pending" },
		{ label: "Reviewed", value: "reviewed" },
		{ label: "Dismissed", value: "dismissed" },
	];

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				{table.getColumn("status") && (
					<DataTableFacetedFilter
						column={table.getColumn("status")}
						title="Status"
						options={statusOptions}
					/>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<Cross2Icon className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
