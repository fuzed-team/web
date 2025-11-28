"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserApi } from "@/types/api";
// TODO: Ensure these files exist or update paths
import { useUser } from "../../context/user-context";

interface UsersTableRowActionsProps {
	row: Row<UserApi>;
}

export function UsersTableRowActions({ row }: UsersTableRowActionsProps) {
	const { setOpen, setCurrentRow } = useUser();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
				>
					<DotsHorizontalIcon className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem
					onClick={() => {
						setCurrentRow(row.original);
						setOpen("edit");
					}}
				>
					Edit
					<DropdownMenuShortcut>
						<IconEdit size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						setCurrentRow(row.original);
						setOpen("delete");
					}}
					className="text-red-500!"
				>
					Delete
					<DropdownMenuShortcut>
						<IconTrash size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
