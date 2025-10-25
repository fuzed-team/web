import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";

export function NavigationProgress() {
	const ref = useRef<LoadingBarRef>(null);
	const pathname = usePathname();

	useEffect(() => {
		// Start loading on pathname change
		ref.current?.continuousStart();

		// Complete after a short delay (Next.js handles navigation)
		const timer = setTimeout(() => {
			ref.current?.complete();
		}, 100);

		return () => clearTimeout(timer);
	}, [pathname]);

	return (
		<LoadingBar
			color="var(--muted-foreground)"
			ref={ref}
			shadow={true}
			height={2}
		/>
	);
}
