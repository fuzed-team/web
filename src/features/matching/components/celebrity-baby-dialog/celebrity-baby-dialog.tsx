"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
	useCelebrityBabyActions,
	useCelebrityBabyOpen,
	useCelebrityMatch,
	useCelebrityUserPhoto,
} from "../../store/celebrity-baby-store";
import { CelebrityBabyGenerator } from "./celebrity-baby-generator";

export function CelebrityBabyDialog() {
	const open = useCelebrityBabyOpen();
	const celebrityMatch = useCelebrityMatch();
	const userPhoto = useCelebrityUserPhoto();
	const { onOpenChange } = useCelebrityBabyActions();

	return (
		<ResponsiveDialog
			open={open}
			onOpenChange={onOpenChange}
			classes={{
				container:
					"sm:max-w-[440px] p-0 shadow-match border-none overflow-hidden rounded-none sm:rounded-3xl",
				overlay: "bg-black/60 backdrop-blur-xl",
			}}
			showCloseButton={false}
		>
			{/* Light mode: subtle purple glow, Dark mode: deeper indigo glow */}
			<div className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(ellipse_at_top,_rgba(192,132,252,0.15),_transparent,_transparent)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(49,46,129,0.4),_transparent,_transparent)] pointer-events-none"></div>
			<CelebrityBabyGenerator
				celebrityMatchId={celebrityMatch?.id || ""}
				userPhoto={userPhoto}
				celebrityPhoto={celebrityMatch?.celeb.image}
				userName="You"
				celebrityName={celebrityMatch?.celeb.name}
				matchPercentage={celebrityMatch?.matchPercentage}
				onBack={() => onOpenChange(false)}
			/>
		</ResponsiveDialog>
	);
}
