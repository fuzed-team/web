"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import type { UserApi } from "@/types/api";
import { useDeleteUser } from "../../api/delete-user";
import type { UsersInput } from "../../api/get-users";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: UserApi;
}

export function UserDeleteDialog({ open, onOpenChange, currentRow }: Props) {
	const [value, setValue] = useState("");
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

	const deleteUserMutation = useDeleteUser({
		inputQuery: usersInput,
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	});

	const handleDelete = () => {
		if (value.trim() !== currentRow.name) return;
		if (deleteUserMutation.isPending) return;
		deleteUserMutation.mutate({ id: currentRow.id });
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleDelete}
			disabled={value.trim() !== currentRow.name}
			title="Delete User"
			desc={
				<span>
					Are you sure you want to delete <strong>{currentRow.name}</strong>
					?
					<br />
					This action cannot be undone.
				</span>
			}
			confirmText="Delete"
			destructive
		>
			<Label className="my-2">
				Name:
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Enter name to confirm"
				/>
			</Label>
			<Alert variant="destructive">
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>Please be certain.</AlertDescription>
			</Alert>
		</ConfirmDialog>
	);
}
