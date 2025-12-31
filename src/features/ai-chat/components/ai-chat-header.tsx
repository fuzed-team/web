"use client";

import { ChevronLeft, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AICelebrity } from "../types";

interface AIChatHeaderProps {
	celebrity: AICelebrity;
	onBack?: () => void;
}

export function AIChatHeader({ celebrity, onBack }: AIChatHeaderProps) {
	const router = useRouter();

	const handleBack = () => {
		if (onBack) {
			onBack();
		} else {
			router.back();
		}
	};

	return (
		<header className="flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={handleBack}
					className="md:hidden"
				>
					<ChevronLeft className="h-6 w-6" />
				</Button>

				<Avatar className="h-10 w-10 border-2 border-blue-500/20">
					<AvatarImage src={celebrity.image_url} alt={celebrity.name} />
					<AvatarFallback>{celebrity.name.charAt(0)}</AvatarFallback>
				</Avatar>

				<div>
					<h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-none mb-1">
						{celebrity.name}
					</h3>
					<p className="text-xs text-blue-500 font-medium">
						AI Powered • {celebrity.category}
					</p>
				</div>
			</div>

			<Button variant="ghost" size="icon">
				<MoreVertical className="h-5 w-5 text-gray-500" />
			</Button>
		</header>
	);
}
