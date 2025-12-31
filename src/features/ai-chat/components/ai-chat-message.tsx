"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { AIMessage } from "../types";

export interface AIChatMessageProps {
	message: AIMessage;
	showHeader?: boolean;
	className?: string;
}

export function AIChatMessage({
	message,
	showHeader = true,
	className,
}: AIChatMessageProps) {
	const isAssistant = message.role === "assistant";

	const formattedTime = new Date(message.created_at).toLocaleTimeString(
		"en-US",
		{
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		},
	);

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.2 }}
			className={cn(
				"flex mb-4",
				isAssistant ? "justify-start" : "justify-end",
				className,
			)}
		>
			<div className="flex flex-col max-w-[80%] sm:max-w-[70%]">
				{showHeader && (
					<div
						className={cn(
							"flex gap-2 text-[10px] px-1 mb-1 text-muted-foreground",
							{
								"justify-end": !isAssistant,
							},
						)}
					>
						<span>{formattedTime}</span>
					</div>
				)}
				<div
					className={cn(
						"px-4 py-2.5 rounded-2xl shadow-sm text-sm wrap-break-word",
						isAssistant
							? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
							: "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10",
					)}
				>
					<p className="whitespace-pre-wrap leading-relaxed">
						{message.content}
					</p>
					{message.is_streaming && (
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
							className="inline-block w-1.5 h-4 ml-1 bg-blue-500 align-middle"
						/>
					)}
				</div>
			</div>
		</motion.div>
	);
}
