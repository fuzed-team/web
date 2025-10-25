"use client";

import { useEffect } from "react";
import GeneralError from "@/components/errors/general-error";

export default function Error({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Error:", error);
	}, [error]);

	return <GeneralError />;
}
