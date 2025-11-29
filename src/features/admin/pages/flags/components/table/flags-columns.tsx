"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Clock, MoreHorizontal, XCircle } from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils/date";
import type { UserFlag } from "@/types/api";
import { FlagReviewDialog } from "../dialog/flag-review-dialog";

export const useFlagsColumns = (): ColumnDef<UserFlag>[] => {
	return [
		{
			accessorKey: "reporter",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Reporter" />
			),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.reporter.name}</span>
					<span className="text-xs text-muted-foreground">
						{row.original.reporter.email}
					</span>
				</div>
			),
		},
		{
			accessorKey: "reported_user",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Reported User" />
			),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.reported_user.name}</span>
					<span className="text-xs text-muted-foreground">
						{row.original.reported_user.email}
					</span>
				</div>
			),
		},
		{
			accessorKey: "reason",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Reason" />
			),
			cell: ({ row }) => (
				<div className="max-w-[300px] truncate" title={row.original.reason}>
					{row.original.reason}
				</div>
			),
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.original.status;

				if (status === "reviewed") {
					return <Badge variant="success">Reviewed</Badge>;
				}

				if (status === "dismissed") {
					return <Badge variant="secondary">Dismissed</Badge>;
				}

				return <Badge variant="destructive">Pending</Badge>;
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
		},
		{
			accessorKey: "created_at",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Date" />
			),
			cell: ({ row }) => <div>{formatDate(row.getValue("created_at"))}</div>,
		},
		{
			id: "actions",
			cell: ({ row }) => <FlagActionsRow row={row.original} />,
		},
	];
};

function FlagActionsRow({ row }: { row: UserFlag }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [action, setAction] = useState<"reviewed" | "dismissed">("reviewed");

	const handleAction = (act: "reviewed" | "dismissed") => {
		setAction(act);
		setDialogOpen(true);
	};

	if (row.status !== "pending") {
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-8 w-8 p-0">
						<span className="sr-only">Open menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => handleAction("reviewed")}>
						<CheckCircle className="mr-2 h-4 w-4 text-green-600" />
						Mark as Reviewed
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleAction("dismissed")}>
						<XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
						Dismiss Flag
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<FlagReviewDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				flag={row}
				action={action}
			/>
		</>
	);
}
