"use client";

import React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useCelebrities } from "../../api/get-celebrities";
import { useCelebritiesSearchParams } from "../../utils/search-params";
import { getCelebrityColumns } from "./celebrity-columns";
import { CelebritiesTableActionBar } from "./celebrity-table-action-bar";

export function CelebritiesTable() {
	const columns = React.useMemo(() => getCelebrityColumns(), []);
	const urlParams = useCelebritiesSearchParams();

	const { data, isLoading, error } = useCelebrities({
		input: urlParams,
	});

	const { table } = useDataTable({
		isLoading,
		data: data?.data ?? [],
		columns,
		getRowId: (originalRow) => originalRow.id,
		pageCount: data?.pagination?.totalPages ?? 0,
	});

	if (error) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-destructive text-lg">Error: {error.message}</div>
			</div>
		);
	}

	return (
		<DataTable
			table={table}
			actionBar={<CelebritiesTableActionBar table={table} />}
		>
			<DataTableToolbar table={table} />
		</DataTable>
	);
}
