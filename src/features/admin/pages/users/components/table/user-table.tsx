"use client";

import React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useUserStats } from "../../api/get-user-stats";
import { useUsers } from "../../api/get-users";
import { useUsersSearchParams } from "../../utils/search-params";
import { getUserColumns } from "./user-columns";
import { UsersTableActionBar } from "./user-table-action-bar";

export function UsersTable() {
	const { data: stats } = useUserStats();
	const columns = React.useMemo(
		() =>
			getUserColumns({
				roleCounts: stats?.role,
				statusCounts: stats?.status,
			}),
		[stats?.role, stats?.status],
	);
	const urlParams = useUsersSearchParams();

	const { data, isLoading, error } = useUsers({
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
		<DataTable table={table} actionBar={<UsersTableActionBar table={table} />}>
			<DataTableToolbar table={table} />
		</DataTable>
	);
}
