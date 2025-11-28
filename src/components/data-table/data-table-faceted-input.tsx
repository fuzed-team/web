import React from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "../ui/input";

export function DataTableFacetedInput({
	value: _value,
	onChange,
	debounceTime = 500,
	...props
}: React.ComponentProps<"input"> & {
	debounceTime?: number;
	onChange: (value: string | null) => void;
}) {
	const [input, setInput] = React.useState<string | null>(_value as string);
	const debouncedInput = useDebounce(input, debounceTime);

	React.useEffect(() => {
		const newValue = debouncedInput?.trim() === "" ? null : debouncedInput;
		if (debouncedInput === null) return;
		onChange?.(newValue);
	}, [debouncedInput]);

	React.useEffect(() => {
		if (_value === "") setInput("");
	}, [_value]);

	return (
		<Input
			value={input || ""}
			onChange={(e) => setInput(e.target.value)}
			{...props}
		/>
	);
}
