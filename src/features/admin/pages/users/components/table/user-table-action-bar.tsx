"use client";

import { SelectTrigger } from "@radix-ui/react-select";
import type { Table } from "@tanstack/react-table";
import { ArrowUp, CheckCircle2, Download, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import {
	DataTableActionBar,
	DataTableActionBarAction,
	DataTableActionBarSelection,
} from "@/components/data-table/data-table-action-bar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { exportTableToCSV } from "@/lib/export";
import type { UserApi } from "@/types/api";
import {
	userRoleOptions,
	userStatusOptions,
} from "../../constants/user-options";

// import { deleteTasks, updateTasks } from "../lib/actions";

const actions = ["update-status", "update-role", "export", "delete"] as const;

type Action = (typeof actions)[number];

interface UsersTableActionBarProps {
	table: Table<UserApi>;
}

export function UsersTableActionBar({ table }: UsersTableActionBarProps) {
	const rows = table.getFilteredSelectedRowModel().rows;
	const [isPending, startTransition] = React.useTransition();
	const [currentAction, setCurrentAction] = React.useState<Action | null>(null);

	const getIsActionPending = (action: Action) =>
		isPending && currentAction === action;

	// const onUserUpdate = ({
	// 	field,
	// 	value,
	// }: {
	// 	field: "status" | "role";
	// 	value: UserApi["status"] | UserApi["role"];
	// }) => {
	// 	setCurrentAction(field === "status" ? "update-status" : "update-role");
	// 	startTransition(async () => {
	// 		// const { error } = await updateTasks({
	// 		// 	ids: rows.map((row) => row.original.id),
	// 		// 	[field]: value,
	// 		// });

	// 		// if (error) {
	// 		// 	toast.error(error);
	// 		// 	return;
	// 		// }
	// 		toast.success("Users updated");
	// 	});
	// };

	const onUserExport = () => {
		setCurrentAction("export");
		startTransition(() => {
			exportTableToCSV(table, {
				excludeColumns: ["select", "actions"],
				onlySelected: true,
			});
		});
	};

	// const onUserDelete = () => {
	// 	setCurrentAction("delete");
	// 	startTransition(async () => {
	// 		// const { error } = await deleteTasks({
	// 		// 	ids: rows.map((row) => row.original.id),
	// 		// });

	// 		// if (error) {
	// 		// 	toast.error(error);
	// 		// 	return;
	// 		// }
	// 		table.toggleAllRowsSelected(false);
	// 	});
	// };

	return (
		<DataTableActionBar table={table} visible={rows.length > 0}>
			<DataTableActionBarSelection table={table} />
			<Separator
				orientation="vertical"
				className="hidden data-[orientation=vertical]:h-5 sm:block"
			/>
			<div className="flex items-center gap-1.5">
				{/* <Select
					onValueChange={(value: UserApi["status"]) =>
						onUserUpdate({ field: "status", value })
					}
				>
					<SelectTrigger asChild>
						<DataTableActionBarAction
							size="icon"
							tooltip="Update status"
							isPending={getIsActionPending("update-status")}
						>
							<CheckCircle2 />
						</DataTableActionBarAction>
					</SelectTrigger>
					<SelectContent align="center">
						<SelectGroup>
							{userStatusOptions.map((status) => (
								<SelectItem
									key={status.value}
									value={status.value}
									className="capitalize"
								>
									{status.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				<Select
					onValueChange={(value: UserApi["role"]) =>
						onUserUpdate({ field: "role", value })
					}
				>
					<SelectTrigger asChild>
						<DataTableActionBarAction
							size="icon"
							tooltip="Update role"
							isPending={getIsActionPending("update-role")}
						>
							<ArrowUp />
						</DataTableActionBarAction>
					</SelectTrigger>
					<SelectContent align="center">
						<SelectGroup>
							{userRoleOptions.map((option) => (
								<SelectItem
									key={option.value}
									value={option.value}
									className="capitalize"
								>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select> */}
				<DataTableActionBarAction
					size="icon"
					tooltip="Export tasks"
					isPending={getIsActionPending("export")}
					onClick={onUserExport}
				>
					<Download />
				</DataTableActionBarAction>
				{/* <DataTableActionBarAction
					size="icon"
					tooltip="Delete tasks"
					isPending={getIsActionPending("delete")}
					onClick={onUserDelete}
				>
					<Trash2 />
				</DataTableActionBarAction> */}
			</div>
		</DataTableActionBar>
	);
}
