"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useFlags } from "../../api/get-flags";
import { useFlagsSearchParams } from "../../utils/search-params";
import { useFlagsColumns } from "./flags-columns";
import { FlagsTableActionBar } from "./flags-table-action-bar";

export function FlagsTable() {
	const columns = useFlagsColumns();
	const urlParams = useFlagsSearchParams();

	const { data, isLoading, error } = useFlags({
		input: urlParams,
	});
	const flags = data?.data ?? [];
	const totalPages = data?.pagination?.totalPages ?? 0;

	const { table } = useDataTable({
		isLoading,
		data: flags,
		columns,
		pageCount: totalPages,
		getRowId: (originalRow) => originalRow.id,
	});

	if (error) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-destructive text-lg">Error: {error.message}</div>
			</div>
		);
	}

	return (
		<DataTable table={table} actionBar={<FlagsTableActionBar table={table} />}>
			<DataTableToolbar table={table} />
		</DataTable>
	);
}
