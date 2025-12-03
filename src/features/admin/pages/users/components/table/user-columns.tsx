"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, CircleDashed, Text } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import LongText from "@/components/long-text";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils/date";
import type { UserApi } from "@/types/api";
import {
	userRoleOptions,
	userStatusOptions,
} from "../../constants/user-options";
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
			size: 40,
			meta: {
				className: checkboxClass,
			},
		},
		{
			id: "name",
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Name" />
			),
			cell: ({ row }) => (
				<LongText className="max-w-36">{row.getValue("name")}</LongText>
			),
			meta: {
				label: "Name",
				placeholder: "Search names...",
				variant: "text",
				icon: Text,
			},
			enableColumnFilter: true,
		},
		{
			id: "email",
			accessorKey: "email",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Email" />
			),
			cell: ({ row }) => (
				<div className="w-fit text-nowrap">{row.getValue("email")}</div>
			),
			meta: {
				label: "Email",
			},
		},
		{
			id: "role",
			accessorKey: "role",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Role" />
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
							<userType.icon className="text-muted-foreground size-4" />
						)}
						<span className="text-sm capitalize">{userType.label}</span>
					</div>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			meta: {
				label: "Role",
				variant: "multiSelect",
				options: userRoleOptions.map((role) => ({
					label: role.label,
					value: role.value,
					// count: statusCounts[role],
					count: 1,
					icon: role.icon,
				})),
				icon: CircleDashed,
			},
			enableColumnFilter: true,
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "status",
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Status" />
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
			meta: {
				label: "Status",
				variant: "multiSelect",
				options: userStatusOptions.map((status) => ({
					label: status.label,
					value: status.value,
					// count: statusCounts[role],
					count: 1,
					icon: status.icon,
				})),
				icon: CircleDashed,
			},
			enableColumnFilter: true,
			enableSorting: false,
		},
		{
			id: "createdAt",
			accessorKey: "createdAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Created At" />
			),
			cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
			meta: {
				label: "Created At",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
		},
		{
			id: "updatedAt",
			accessorKey: "updatedAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Updated At" />
			),
			cell: ({ row }) => <div>{formatDate(row.getValue("updatedAt"))}</div>,
			meta: {
				label: "Updated At",
			},
		},
		{
			id: "actions",
			cell: UsersTableRowActions,
			size: 40,
		},
	];
};
