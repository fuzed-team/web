"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import type { UserApi } from "@/types/api";
import { useUnsuspendUser } from "../../api/unsuspend-user";
import { useUsersSearchParams } from "../../utils/search-params";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: UserApi;
}

export function UserUnsuspendDialog({ open, onOpenChange, currentRow }: Props) {
	const urlParams = useUsersSearchParams();

	const unsuspendUserMutation = useUnsuspendUser({
		inputQuery: urlParams,
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	});

	const handleUnsuspend = () => {
		if (unsuspendUserMutation.isPending) return;
		unsuspendUserMutation.mutate({ id: currentRow.id });
	};

	return (
		<ConfirmDialog
			isLoading={unsuspendUserMutation.isPending}
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleUnsuspend}
			title="Unsuspend User Account"
			desc={
				<span>
					Are you sure you want to unsuspend <strong>{currentRow.name}</strong>
					's account?
					<br />
					They will be able to access the application again.
				</span>
			}
			confirmText="Unsuspend Account"
		>
			<Alert>
				<AlertTitle>Info</AlertTitle>
				<AlertDescription>
					{currentRow.suspension_reason
						? `This account was suspended for: "${currentRow.suspension_reason}"`
						: "This account is currently suspended."}
				</AlertDescription>
			</Alert>
		</ConfirmDialog>
	);
}
