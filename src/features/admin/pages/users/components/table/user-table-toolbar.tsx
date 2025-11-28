"use client";

import type { Table } from "@tanstack/react-table";
import { TrashIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import confirm from "@/components/confirm";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import { SingleDayPicker } from "@/components/ui/single-day-picker";
import type { UserApi } from "@/types/api";
import type { DataTableFilterField } from "@/types/common";
import { useDeleteUsers } from "../../api/delete-users";
import type { UsersInput } from "../../api/get-users";

interface UsersTableToolbarProps<TData> {
	table: Table<TData>;
	filterFields: DataTableFilterField<TData>[];
}

export function UsersTableToolbar({
	table,
	filterFields,
}: UsersTableToolbarProps<UserApi>) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const selectedRowIds = table
		.getFilteredSelectedRowModel()
		.rows.map((row) => row.original.id);

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || 10;
	const name = searchParams.get("name") || undefined;
	const role = searchParams.get("role") || undefined;
	const sort = searchParams.get("sort") || undefined;
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
		sort,
	};

	const deleteUsersMutation = useDeleteUsers({
		inputQuery: usersInput,
		mutationConfig: {
			onSuccess: () => {
				table.resetRowSelection();
			},
		},
	});

	const handleDeleteAll = () => {
		if (selectedRowIds.length === 0 || deleteUsersMutation.isPending) return;

		confirm({
			type: "warning",
			title: "Delete Users",
			description: `Are you sure you want to delete ${selectedRowIds.length} users?`,
			confirmText: "Delete",
			cancelText: "Cancel",
			onConfirm: () => {
				deleteUsersMutation.mutate({ ids: selectedRowIds });
			},
		});
	};

	const handleCreatedAtFromChange = (date: Date | undefined) => {
		const newSearchParams = new URLSearchParams(searchParams.toString());
		if (date) {
			newSearchParams.set("createdAtFrom", date.toISOString());
		} else {
			newSearchParams.delete("createdAtFrom");
		}
		router.push(`?${newSearchParams.toString()}`);
	};

	return (
		<DataTableToolbar table={table} filterFields={filterFields}>
			<div className="flex flex-wrap items-center gap-2">
				{/* <div className="flex items-center gap-2">
					<SingleDayPicker
						value={createdAtFrom}
						onChange={handleCreatedAtFromChange}
						placeholder="Select Created At From"
					/>
				</div> */}
				{selectedRowIds.length > 0 && (
					<Button
						variant="destructive"
						className="h-8"
						onClick={handleDeleteAll}
					>
						<TrashIcon className="mr-2 h-4 w-4" />
						Delete {selectedRowIds.length} Users
					</Button>
				)}
			</div>
		</DataTableToolbar>
	);
}
