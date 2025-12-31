"use client";

import { motion } from "framer-motion";

export function AITypingIndicator() {
	return (
		<div className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none w-fit">
			<motion.div
				className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
				animate={{ y: [0, -4, 0] }}
				transition={{
					duration: 0.6,
					repeat: Number.POSITIVE_INFINITY,
					delay: 0,
				}}
			/>
			<motion.div
				className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
				animate={{ y: [0, -4, 0] }}
				transition={{
					duration: 0.6,
					repeat: Number.POSITIVE_INFINITY,
					delay: 0.2,
				}}
			/>
			<motion.div
				className="size-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
				animate={{ y: [0, -4, 0] }}
				transition={{
					duration: 0.6,
					repeat: Number.POSITIVE_INFINITY,
					delay: 0.4,
				}}
			/>
		</div>
	);
}
