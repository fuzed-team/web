"use client";

import React, { useState } from "react";
import { useDialogState } from "@/hooks/use-dialog-state";
import type { UserApi } from "@/types/api";

type UserDialogType = "invite" | "add" | "edit" | "delete";

interface UserContextType {
	open: UserDialogType | null;
	setOpen: (str: UserDialogType | null) => void;
	currentRow: UserApi | null;
	setCurrentRow: React.Dispatch<React.SetStateAction<UserApi | null>>;
}

const UserContext = React.createContext<UserContextType | null>(null);

interface Props {
	children: React.ReactNode;
}

export function UsersProvider({ children }: Props) {
	const [open, setOpen] = useDialogState<UserDialogType>(null);
	const [currentRow, setCurrentRow] = useState<UserApi | null>(null);

	return (
		<UserContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
			{children}
		</UserContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
	const userContext = React.useContext(UserContext);

	if (!userContext) {
		throw new Error("useUser has to be used within <UserContext>");
	}

	return userContext;
};
