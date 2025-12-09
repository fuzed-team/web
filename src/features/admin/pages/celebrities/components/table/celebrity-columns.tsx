"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, Circle, CircleDashed, Star, Text } from "lucide-react";
import Image from "next/image";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import LongText from "@/components/long-text";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils/date";
import type { CelebrityApi } from "../../api/get-celebrities";
import {
	celebrityCategoryOptions,
	celebrityGenderOptions,
} from "../../constants/celebrity-options";
import { useCelebrity } from "../../context/celebrity-context";
import { getCelebrityImageUrl } from "../../utils/celebrity-helpers";
import { CelebritiesTableRowActions } from "./celebrity-table-row-actions";

// Standalone component to use hooks within table cell
function NameCell({
	row,
}: {
	row: { original: CelebrityApi; getValue: (id: string) => string };
}) {
	const { setOpen, setCurrentRow } = useCelebrity();
	return (
		<button
			type="button"
			className="text-left hover:underline cursor-pointer max-w-36"
			onClick={() => {
				setCurrentRow(row.original);
				setOpen("view");
			}}
		>
			<LongText className="max-w-36">{row.getValue("name")}</LongText>
		</button>
	);
}

export const checkboxClass =
	"sticky md:table-cell left-0 z-10 rounded-tl bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted w-12";

export const getCelebrityColumns = ({
	categoryCounts,
	genderCounts,
}: {
	categoryCounts?: Record<string, number>;
	genderCounts?: Record<string, number>;
} = {}): ColumnDef<CelebrityApi>[] => {
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
			id: "image",
			accessorKey: "image_path",
			header: () => <span>Image</span>,
			cell: ({ row }) => (
				<div className="relative size-10 rounded-md overflow-hidden bg-muted">
					<Image
						src={getCelebrityImageUrl(row.original.image_path)}
						alt={row.original.name}
						fill
						className="object-cover"
					/>
				</div>
			),
			enableSorting: false,
			size: 60,
		},
		{
			id: "name",
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Name" />
			),
			cell: NameCell,
			meta: {
				label: "Name",
				placeholder: "Search celebrities...",
				variant: "text",
				icon: Text,
			},
			enableColumnFilter: true,
		},
		{
			id: "category",
			accessorKey: "category",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Category" />
			),
			cell: ({ row }) => {
				const category = row.original.category;
				const categoryOption = celebrityCategoryOptions.find(
					({ value }) => value === category,
				);

				return (
					<Badge variant="outline" className="capitalize">
						{categoryOption?.label || category}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			meta: {
				label: "Category",
				variant: "multiSelect",
				options: celebrityCategoryOptions.map((cat) => ({
					label: cat.label,
					value: cat.value,
					count: categoryCounts?.[cat.value] ?? 0,
					icon: cat.icon,
				})),
				icon: CircleDashed,
			},
			enableColumnFilter: true,
			enableSorting: false,
		},
		{
			id: "gender",
			accessorKey: "gender",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Gender" />
			),
			cell: ({ row }) => {
				const gender = row.original.gender;
				return (
					<Badge variant={gender === "male" ? "default" : "secondary"}>
						{gender}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			meta: {
				label: "Gender",
				variant: "multiSelect",
				options: celebrityGenderOptions.map((g) => ({
					label: g.label,
					value: g.value,
					count: genderCounts?.[g.value] ?? 0,
					icon: g.icon,
				})),
				icon: CircleDashed,
			},
			enableColumnFilter: true,
			enableSorting: false,
		},
		{
			id: "quality_score",
			accessorKey: "quality_score",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Quality" />
			),
			cell: ({ row }) => {
				const score = row.original.quality_score;
				if (!score) return <span className="text-muted-foreground">N/A</span>;

				return (
					<span
						className={
							score >= 0.8
								? "text-green-600"
								: score >= 0.6
									? "text-yellow-600"
									: "text-red-600"
						}
					>
						{(score * 100).toFixed(0)}%
					</span>
				);
			},
			meta: {
				label: "Quality",
			},
		},
		{
			id: "is_featured",
			accessorKey: "is_featured",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Status" />
			),
			cell: ({ row }) => {
				const isFeatured = row.original.is_featured;
				if (isFeatured) {
					return (
						<Badge className="bg-amber-500 hover:bg-amber-600">
							<Star className="size-3 mr-1" />
							Featured
						</Badge>
					);
				}
				return <span className="text-muted-foreground text-sm">-</span>;
			},
			filterFn: (row, id, value) => {
				return value.includes(String(row.getValue(id)));
			},
			enableColumnFilter: true,
			meta: {
				label: "Status",
				variant: "select",
				options: [
					{
						label: "Featured",
						value: "true",
						icon: Star,
					},
					{
						label: "Standard",
						value: "false",
						icon: Circle,
					},
				],
			},
		},
		{
			id: "created_at",
			accessorKey: "created_at",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} label="Created At" />
			),
			cell: ({ row }) => <div>{formatDate(row.getValue("created_at"))}</div>,
			meta: {
				label: "Created At",
				variant: "dateRange",
				icon: CalendarIcon,
			},
			enableColumnFilter: true,
		},
		{
			id: "actions",
			cell: CelebritiesTableRowActions,
			size: 40,
		},
	];
};
