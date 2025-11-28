"use client";

import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { UserApi } from "@/types/api";
import type { DataTableFilterField } from "@/types/common";
import { type UsersInput, useUsers } from "../../api/get-users";
import { userRoleOptions } from "../../constants/user-options";
import { useUserColumns } from "./user-columns";
import { UsersTableToolbar } from "./user-table-toolbar";

export function UsersTable() {
	const columns = useUserColumns();
	const searchParams = useSearchParams();

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || 10;
	const name = searchParams.get("name") || undefined;
	const role = searchParams.get("role") || undefined;
	const createdAtFrom = searchParams.get("createdAtFrom")
		? new Date(searchParams.get("createdAtFrom")!)
		: undefined;
	const createdAtTo = searchParams.get("createdAtTo")
		? new Date(searchParams.get("createdAtTo")!)
		: undefined;

	const usersInput: UsersInput = {
		page,
		limit,
		name,
		role: role ? [role as any] : undefined,
		createdAtFrom: createdAtFrom?.toISOString(),
		createdAtTo: createdAtTo?.toISOString(),
	};

	const { data, isLoading, error } = useUsers({
		input: usersInput,
	});

	const total = data?.pagination?.totalRecords ?? 0;

	const filterFields: DataTableFilterField<UserApi>[] = [
		{
			label: "Name",
			value: "name",
			placeholder: "Filter by name...",
		},
		{
			label: "Role",
			value: "role",
			options: userRoleOptions,
		},
	];

	const { table } = useDataTable({
		isLoading,
		data: data?.data ?? [],
		columns,
		rowCount: total,
		filterFields,
	});

	if (error) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-destructive text-lg">Error: {error.message}</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<UsersTableToolbar table={table} filterFields={filterFields} />
			<DataTable table={table} />
		</div>
	);
}
