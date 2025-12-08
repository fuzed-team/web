"use client";

import React, { useState } from "react";
import { useDialogState } from "@/hooks/use-dialog-state";
import type { CelebrityApi } from "../api/get-celebrities";

export type Celebrity = CelebrityApi;

type CelebrityDialogType =
	| "add"
	| "generate"
	| "edit"
	| "delete"
	| "view"
	| "set-featured";

interface CelebrityContextType {
	open: CelebrityDialogType | null;
	setOpen: (str: CelebrityDialogType | null) => void;
	currentRow: Celebrity | null;
	setCurrentRow: React.Dispatch<React.SetStateAction<Celebrity | null>>;
}

const CelebrityContext = React.createContext<CelebrityContextType | null>(null);

interface Props {
	children: React.ReactNode;
}

export function CelebritiesProvider({ children }: Props) {
	const [open, setOpen] = useDialogState<CelebrityDialogType>(null);
	const [currentRow, setCurrentRow] = useState<Celebrity | null>(null);

	return (
		<CelebrityContext.Provider
			value={{ open, setOpen, currentRow, setCurrentRow }}
		>
			{children}
		</CelebrityContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCelebrity = () => {
	const celebrityContext = React.useContext(CelebrityContext);

	if (!celebrityContext) {
		throw new Error("useCelebrity has to be used within <CelebrityContext>");
	}

	return celebrityContext;
};
