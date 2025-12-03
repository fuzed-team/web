"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useUsers } from "../../api/get-users";
import { useUsersSearchParams } from "../../utils/search-params";
import { useUserColumns } from "./user-columns";

export function UsersTable() {
	const columns = useUserColumns();
	const urlParams = useUsersSearchParams();

	const { data, isLoading, error } = useUsers({
		input: urlParams,
	});

	const { table } = useDataTable({
		isLoading,
		data: data?.data ?? [],
		columns,
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
		<DataTable table={table}>
			<DataTableToolbar table={table} />
		</DataTable>
	);
}
