"use client";

import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useRef } from "react";

interface Props {
	children: React.ReactNode;
}

const LandingPageLayout = ({ children }: Props) => {
	const { setTheme, theme } = useTheme();
	const previousTheme = useRef<string | undefined>(undefined);

	useEffect(() => {
		// Store the current theme before changing
		previousTheme.current = theme;
		// Force light theme
		setTheme("light");

		return () => {
			// Restore previous theme on unmount
			if (previousTheme.current) {
				setTheme(previousTheme.current);
			}
		};
	}, []);

	return <>{children}</>;
};

export default LandingPageLayout;
