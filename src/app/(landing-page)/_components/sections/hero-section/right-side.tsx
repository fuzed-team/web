"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function RightSide() {
	return (
		<div className="w-full flex items-center justify-center relative">
			<DotLottieReact
				src="/lotties/landing-page.json"
				loop
				autoplay
				className="w-full max-w-[340px] md:max-w-[600px] lg:max-w-[800px] md:w-[800px] aspect-square"
			/>
		</div>
	);
}
