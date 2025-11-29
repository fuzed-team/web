"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import type { UserApi } from "@/types/api";
import type { UsersInput } from "../../api/get-users";
import { useUnsuspendUser } from "../../api/unsuspend-user";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: UserApi;
}

export function UserUnsuspendDialog({ open, onOpenChange, currentRow }: Props) {
	const searchParams = useSearchParams();

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || 10;
	const name = searchParams.get("name") || undefined;
	const role = searchParams.get("role") || undefined;
	const sort = searchParams.get("sort") || undefined;
	const createdAtFrom = searchParams.get("createdAtFrom")
		? new Date(searchParams.get("createdAtFrom")!)
		: undefined;
	const createdAtTo = searchParams.get("createdAtTo")
		? new Date(searchParams.get("createdAtTo")!)
		: undefined;

	const usersInput: UsersInput = {
		page,
		limit,
		name,
		role: role ? [role as any] : undefined,
		createdAtFrom: createdAtFrom?.toISOString(),
		createdAtTo: createdAtTo?.toISOString(),
		sort,
	};

	const unsuspendUserMutation = useUnsuspendUser({
		inputQuery: usersInput,
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
