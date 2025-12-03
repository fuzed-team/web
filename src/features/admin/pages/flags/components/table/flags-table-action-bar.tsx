"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import * as React from "react";
import {
	DataTableActionBar,
	DataTableActionBarAction,
	DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import { Separator } from "@/components/ui/separator";
import { exportTableToCSV } from "@/lib/export";
import type { UserFlag } from "@/types/api";

interface FlagsTableActionBarProps {
	table: Table<UserFlag>;
}

export function FlagsTableActionBar({ table }: FlagsTableActionBarProps) {
	const rows = table.getFilteredSelectedRowModel().rows;
	const [isPending, startTransition] = React.useTransition();
	const [currentAction, setCurrentAction] = React.useState<string | null>(null);

	const getIsActionPending = (action: string) =>
		isPending && currentAction === action;

	const onExport = () => {
		setCurrentAction("export");
		startTransition(() => {
			exportTableToCSV(table, {
				excludeColumns: ["select", "actions"],
				onlySelected: true,
			});
		});
	};

	return (
		<DataTableActionBar table={table} visible={rows.length > 0}>
			<DataTableActionBarSelection table={table} />
			<Separator
				orientation="vertical"
				className="hidden data-[orientation=vertical]:h-5 sm:block"
			/>
			<div className="flex items-center gap-1.5">
				<DataTableActionBarAction
					size="icon"
					tooltip="Export flags"
					isPending={getIsActionPending("export")}
					onClick={onExport}
				>
					<Download />
				</DataTableActionBarAction>
			</div>
		</DataTableActionBar>
	);
}
