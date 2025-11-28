import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { IconChevronDown } from "@tabler/icons-react";
import type { Column } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { DataTableOption } from "@/types/common";

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
	options: DataTableOption[];
	multiple?: boolean;
}

export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	multiple = true,
}: DataTableFacetedFilterProps<TData, TValue>) {

	const filterValue = column?.getFilterValue();
	const selectedValues = multiple
		? new Set(filterValue as string[])
		: filterValue
			? new Set([filterValue as string])
			: new Set();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="sm" className="bg-accent h-8">
					<PlusCircledIcon className="size-4" />
					{title}
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{multiple ? (
									selectedValues.size > 2 ? (
										<Badge
											variant="secondary"
											className="rounded-sm px-1 font-normal"
										>
											{selectedValues.size} selected
										</Badge>
									) : (
										options
											.filter((option) => selectedValues.has(option.value))
											.map((option) => (
												<Badge
													variant="secondary"
													key={option.value}
													className="rounded-sm px-1 font-normal"
												>
													{option.label}
												</Badge>
											))
									)
								) : (
									options
										.filter((option) => selectedValues.has(option.value))
										.map((option) => (
											<Badge
												variant="secondary"
												key={option.value}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
					<div className="grid size-5 place-items-center rounded bg-white shadow-none">
						<IconChevronDown className="text-foreground size-4 opacity-50" />
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[12.5rem] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isSelected = selectedValues.has(option.value);

								return (
									<CommandItem
										key={option.value}
										onSelect={() => {
											if (multiple) {
												if (isSelected) {
													selectedValues.delete(option.value);
												} else {
													selectedValues.add(option.value);
												}
												const filterValues = Array.from(selectedValues);
												column?.setFilterValue(
													filterValues.length ? filterValues : undefined,
												);
											} else {
												column?.setFilterValue(
													isSelected ? undefined : option.value,
												);
											}
										}}
									>
										<div
											className={cn(
												"border-primary mr-2 flex size-4 items-center justify-center rounded-sm border",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className="size-4" aria-hidden="true" />
										</div>
										{option.icon && (
											<option.icon
												className="text-muted-foreground mr-2 size-4"
												aria-hidden="true"
											/>
										)}
										<span>{option.label}</span>
										{option.withCount &&
											column?.getFacetedUniqueValues()?.get(option.value) && (
												<span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
													{column?.getFacetedUniqueValues().get(option.value)}
												</span>
											)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className="justify-center text-center"
									>
										Clear filters
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
