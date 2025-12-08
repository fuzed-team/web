"use client";

import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCelebrity } from "../context/celebrity-context";

export function CelebritiesPrimaryButtons() {
	const { setOpen } = useCelebrity();

	return (
		<div className="flex gap-2">
			<Button variant="outline" className="space-x-1">
				<Download className="size-4" />
				<span>Export</span>
			</Button>
			<Button className="space-x-1" onClick={() => setOpen("generate")}>
				<Plus className="size-4" />
				<span>Generate New</span>
			</Button>
		</div>
	);
}
