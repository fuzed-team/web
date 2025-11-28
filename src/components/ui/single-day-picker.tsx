import { CalendarIcon } from "lucide-react";
import type { PropsSingleRequired } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";

type SingleDayPickerProps = React.ComponentProps<typeof Calendar> & {
	value: PropsSingleRequired["selected"] | string;
	onChange: PropsSingleRequired["onSelect"];
	placeholder?: string;
};

function SingleDayPicker({
	value,
	onChange,
	disabled = false,
	placeholder = "Pick a date",
	...props
}: SingleDayPickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"pl-3 text-left font-normal",
						!value && "text-muted-foreground",
					)}
				>
					{value ? (
						formatDate(value, { period: "date" })
					) : (
						<span>{placeholder}</span>
					)}
					<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={value as any}
					onSelect={onChange as any}
					defaultMonth={value as any}
					captionLayout="dropdown"
					disabled={disabled}
					{...props}
				/>
			</PopoverContent>
		</Popover>
	);
}

export { SingleDayPicker };
