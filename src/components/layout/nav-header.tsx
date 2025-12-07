"use client";

import { cn } from "@/lib/utils";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
	ref?: React.Ref<HTMLElement>;
};

export function NavHeader({ className, children, ...props }: HeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-10 flex h-14 items-center justify-end gap-2 bg-background/95 max-w-7xl mx-auto w-full px-6 md:px-10 backdrop-blur supports-[backdrop-filter]:bg-background/60",
				className,
			)}
			{...props}
		>
			{children}
		</header>
	);
}
