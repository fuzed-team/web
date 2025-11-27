"use client";

import { useRouter } from "next/navigation";
import { ConfirmDialog } from "./confirm-dialog";

interface SignOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
	const router = useRouter();

	const handleSignOut = () => {
		// Preserve current location for redirect after sign-in
		const currentPath = window.location.pathname + window.location.search;
		router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`);
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Sign out"
			desc="Are you sure you want to sign out? You will need to sign in again to access your account."
			confirmText="Sign out"
			destructive
			handleConfirm={handleSignOut}
			className="sm:max-w-sm"
		/>
	);
}
