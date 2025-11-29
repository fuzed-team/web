"use client";

import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { FlagsInput } from "../../api/get-flags";
import { useFlags } from "../../api/get-flags";
import { useFlagsColumns } from "./flags-columns";
import { FlagsTableToolbar } from "./flags-table-toolbar";

export function FlagsTable() {
	const columns = useFlagsColumns();
	const searchParams = useSearchParams();

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || 10;
	const status = searchParams.get("status") as FlagsInput["status"];

	const flagsInput: FlagsInput = {
		page,
		limit,
		status,
	};

	const { data, isLoading, error } = useFlags({
		input: flagsInput,
	});
	const flags = data?.data ?? [];
	const total = data?.pagination?.totalRecords ?? 0;

	const { table } = useDataTable({
		isLoading,
		data: flags,
		columns,
		rowCount: total,
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
			<FlagsTableToolbar table={table} />
			<DataTable table={table} />
		</div>
	);
}
