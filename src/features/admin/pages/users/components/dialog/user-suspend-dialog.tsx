"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import type { UserApi } from "@/types/api";
import type { UsersInput } from "../../api/get-users";
import { useSuspendUser } from "../../api/suspend-user";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: UserApi;
}

export function UserSuspendDialog({ open, onOpenChange, currentRow }: Props) {
	const [reason, setReason] = useState("");
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

	const suspendUserMutation = useSuspendUser({
		inputQuery: usersInput,
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
				setReason("");
			},
		},
	});

	const handleSuspend = () => {
		if (reason.trim().length < 1) return;
		if (suspendUserMutation.isPending) return;
		suspendUserMutation.mutate({ id: currentRow.id, reason });
	};

	return (
		<ConfirmDialog
			isLoading={suspendUserMutation.isPending}
			open={open}
			onOpenChange={(open) => {
				onOpenChange(open);
				if (!open) setReason("");
			}}
			handleConfirm={handleSuspend}
			disabled={reason.trim().length < 1}
			title="Suspend User Account"
			desc={
				<span>
					Are you sure you want to suspend <strong>{currentRow.name}</strong>'s
					account?
					<br />
					They will not be able to access the application until unsuspended.
				</span>
			}
			confirmText="Suspend Account"
			destructive
		>
			<Label className="my-2">
				Suspension Reason:
				<Textarea
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Enter reason for suspension..."
					rows={3}
					className="mt-2"
				/>
			</Label>
			<Alert variant="destructive">
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>
					This user will be immediately blocked from logging in.
				</AlertDescription>
			</Alert>
		</ConfirmDialog>
	);
}
