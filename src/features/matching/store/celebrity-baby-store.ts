import { create } from "zustand";
import type { CelebMatch } from "../utils/transform-api-data";

interface CelebrityBabyStore {
	open: boolean;
	celebrityMatch: CelebMatch | null;
	userPhoto: string | null;
	actions: {
		onOpen: (celebrityMatch: CelebMatch, userPhoto: string) => void;
		onClose: () => void;
		onOpenChange: (open: boolean) => void;
	};
}

const useCelebrityBabyStore = create<CelebrityBabyStore>()((set) => ({
	open: false,
	celebrityMatch: null,
	userPhoto: null,
	actions: {
		onOpen: (celebrityMatch: CelebMatch, userPhoto: string) => {
			set({ open: true, celebrityMatch, userPhoto });
		},
		onClose: () => {
			set({
				open: false,
				celebrityMatch: null,
				userPhoto: null,
			});
		},
		onOpenChange: (open: boolean) => {
			set({ open });
			if (!open) {
				set({
					open: false,
					celebrityMatch: null,
					userPhoto: null,
				});
			}
		},
	},
}));

export const useCelebrityBabyOpen = () =>
	useCelebrityBabyStore((state) => state.open);
export const useCelebrityMatch = () =>
	useCelebrityBabyStore((state) => state.celebrityMatch);
export const useCelebrityUserPhoto = () =>
	useCelebrityBabyStore((state) => state.userPhoto);
export const useCelebrityBabyActions = () =>
	useCelebrityBabyStore((state) => state.actions);
