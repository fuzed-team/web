"use client";

import { Send } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AIMessageInputProps {
	onSend: (content: string) => void;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

export function AIMessageInput({
	onSend,
	disabled = false,
	placeholder = "Send a message...",
	className,
}: AIMessageInputProps) {
	const [message, setMessage] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSend = () => {
		const trimmed = message.trim();
		if (!trimmed || disabled) return;

		onSend(trimmed);
		setMessage("");

		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
		textareaRef.current?.focus();
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleChange = (value: string) => {
		setMessage(value);
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	};

	return (
		<div
			className={cn(
				"border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-md p-4 sticky bottom-0 z-10",
				className,
			)}
		>
			<div className="flex items-end gap-2 max-w-4xl mx-auto">
				<Textarea
					ref={textareaRef}
					value={message}
					onChange={(e) => handleChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					disabled={disabled}
					rows={1}
					className={cn(
						"resize-none min-h-[44px] max-h-[150px] focus-visible:ring-blue-500/50 rounded-2xl",
						"transition-all bg-gray-50 dark:bg-gray-900 border-none shadow-inner",
					)}
					aria-label="AI message input"
				/>
				<Button
					onClick={handleSend}
					disabled={disabled || !message.trim()}
					size="icon"
					className="shrink-0 size-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
					aria-label="Send AI message"
				>
					<Send className="h-5 w-5" />
				</Button>
			</div>
		</div>
	);
}
