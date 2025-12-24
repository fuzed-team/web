import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
	useMatchId,
	useMatchMode,
	useUserMatches,
	useUserMatchesActions,
	useUserMatchesOpen,
} from "../../store/user-matches";
import { BabyGenerator } from "./baby-generator";

export function MatchDialog() {
	const open = useUserMatchesOpen();
	const userMatches = useUserMatches();
	const matchId = useMatchId();
	const mode = useMatchMode();
	const { onOpenChange } = useUserMatchesActions();

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
			<BabyGenerator
				matchId={matchId || undefined}
				userPhoto={userMatches?.user1.photo}
				matchPhoto={userMatches?.user2.photo}
				userName={userMatches?.user1.name}
				matchName={userMatches?.user2.name}
				matchPercentage={userMatches?.matchPercentage}
				mode={mode}
				onBack={() => onOpenChange(false)}
			/>
		</ResponsiveDialog>
	);
}
