import {
	type ColumnMeta,
	flexRender,
	type Row,
	type RowData,
	type Table as TanstackTable,
} from "@tanstack/react-table";
import type * as React from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
	/**
	 * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
	 * @type TanstackTable<TData>
	 */
	table: TanstackTable<TData>;

	/**
	 * The floating bar to render at the bottom of the table on row selection.
	 * @default null
	 * @type React.ReactNode | null
	 * @example floatingBar={<TasksTableFloatingBar table={table} />}
	 */
	floatingBar?: React.ReactNode | null;

	/**
	 * Whether to enable pagination.
	 * @default true
	 * @type boolean
	 */
	enablePagination?: boolean;

	/**
	 * The function to handle row click.
	 * @default null
	 * @type (row: Row<TData>) => void | null
	 */
	onRowClick?: (row: Row<TData>) => void;
}

declare module "@tanstack/react-table" {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface ColumnMeta<TData extends RowData, TValue> {
		className?: string;
		align?: "left" | "center" | "right";
	}
}

export function DataTable<TData>({
	table,
	floatingBar = null,
	enablePagination = true,
	onRowClick,
}: DataTableProps<TData>) {
	return (
		<div className="w-full space-y-2.5 overflow-auto">
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader className="bg-[#e9edf0]">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="[&_th]:border-r [&_th:last-child]:border-r-0"
							>
								{headerGroup.headers.map((header) => {
									const meta = header.column.columnDef.meta as ColumnMeta<
										TData,
										any
									>;
									return (
										<TableHead
											key={header.id}
											className={cn(
												meta?.className,
												meta?.align === "center" && "text-center",
												meta?.align === "right" && "text-right",
											)}
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
									className="bg-white [&_td]:border-r [&_td:last-child]:border-r-0"
									onClick={() => onRowClick?.(row)}
								>
									{row.getVisibleCells().map((cell) => {
										const meta = cell.column.columnDef.meta as ColumnMeta<
											TData,
											any
										>;
										return (
											<TableCell
												key={cell.id}
												className={cn(
													meta?.className,
													meta?.align === "center" && "text-center",
													meta?.align === "right" && "text-right",
												)}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										);
									})}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex flex-col gap-2.5">
				{enablePagination && <DataTablePagination table={table} />}
				{table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
			</div>
		</div>
	);
}
