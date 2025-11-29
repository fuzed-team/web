"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import LongText from "@/components/long-text";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils/date";
import type { UserApi } from "@/types/api";
import { userRoleOptions } from "../../constants/user-options";
import { UsersTableRowActions } from "./user-table-row-actions";

export const checkboxClass =
	"sticky md:table-cell left-0 z-10 rounded-tl bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted w-12";

export const useUserColumns = (): ColumnDef<UserApi>[] => {
	return [
		{
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all"
					className="translate-y-[2px]"
				/>
			),
			meta: { className: checkboxClass },
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
					className="translate-y-[2px]"
				/>
			),
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Name" />
			),
			cell: ({ row }) => (
				<LongText className="max-w-36">{row.getValue("name")}</LongText>
			),
			meta: { className: "w-36" },
		},
		{
			accessorKey: "email",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Email" />
			),
			cell: ({ row }) => (
				<div className="w-fit text-nowrap">{row.getValue("email")}</div>
			),
		},
		{
			accessorKey: "role",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Role" />
			),
			cell: ({ row }) => {
				const { role } = row.original;
				const userType = userRoleOptions.find(({ value }) => value === role);

				if (!userType) {
					return null;
				}

				return (
					<div className="flex items-center gap-x-2">
						{userType.icon && (
							<userType.icon size={16} className="text-muted-foreground" />
						)}
						<span className="text-sm capitalize">{userType.label}</span>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Status" />
			),
			cell: ({ row }) => {
				const status = row.original.status || "active";
				const statusConfig = {
					active: { label: "Active", variant: "success" as const },
					suspended: { label: "Suspended", variant: "destructive" as const },
					deleted: { label: "Deleted", variant: "secondary" as const },
				};
				const config =
					statusConfig[status as keyof typeof statusConfig] ||
					statusConfig.active;

				return <Badge variant={config.variant}>{config.label}</Badge>;
			},
			enableSorting: false,
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Created At" />
			),
			cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
		},
		{
			accessorKey: "updatedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Updated At" />
			),
			cell: ({ row }) => <div>{formatDate(row.getValue("updatedAt"))}</div>,
		},
		{
			id: "actions",
			meta: { className: "w-12" },
			cell: UsersTableRowActions,
		},
	];
};
