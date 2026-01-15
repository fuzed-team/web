"use client";

import Image from "next/image";

export function RightSide() {
	return (
		<div className="w-full flex items-center justify-center relative">
			<Image
				src="/images/hero/hero-mockup-4.png"
				alt="Fuzed app mockup showing dating profiles and matches"
				width={800}
				height={800}
				className="w-full max-w-[340px] md:max-w-[500px] lg:max-w-[700px] h-auto object-contain"
				priority
			/>
		</div>
	);
}
