"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Row } from "@tanstack/react-table";
import { Eye, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CelebrityApi } from "../../api/get-celebrities";
import { useCelebrity } from "../../context/celebrity-context";

interface CelebritiesTableRowActionsProps {
	row: Row<CelebrityApi>;
}

export function CelebritiesTableRowActions({
	row,
}: CelebritiesTableRowActionsProps) {
	const { setOpen, setCurrentRow } = useCelebrity();

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
			<DropdownMenuContent align="end" className="w-[180px]">
				<DropdownMenuItem
					onClick={() => {
						setCurrentRow(row.original);
						setOpen("view");
					}}
				>
					View Details
					<DropdownMenuShortcut>
						<Eye size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setCurrentRow(row.original);
						setOpen("set-featured");
					}}
				>
					Set as Featured
					<DropdownMenuShortcut>
						<Star size={16} />
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
						<Trash2 size={16} />
					</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
