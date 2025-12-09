"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import { useDeleteCelebrity } from "../../api/delete-celebrity";
import type { CelebrityApi } from "../../api/get-celebrities";
import { useCelebritiesSearchParams } from "../../utils/search-params";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: CelebrityApi;
}

export function CelebrityDeleteDialog({
	open,
	onOpenChange,
	currentRow,
}: Props) {
	const [value, setValue] = useState("");
	const urlParams = useCelebritiesSearchParams();

	const deleteCelebrityMutation = useDeleteCelebrity({
		inputQuery: urlParams,
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
				setValue("");
			},
		},
	});

	const handleDelete = () => {
		if (value.trim() !== currentRow.name) return;
		if (deleteCelebrityMutation.isPending) return;
		deleteCelebrityMutation.mutate({ id: currentRow.id });
	};

	return (
		<ConfirmDialog
			isLoading={deleteCelebrityMutation.isPending}
			open={open}
			onOpenChange={(isOpen) => {
				onOpenChange(isOpen);
				if (!isOpen) setValue("");
			}}
			handleConfirm={handleDelete}
			disabled={value.trim() !== currentRow.name}
			title="Delete Celebrity"
			desc={
				<span>
					Are you sure you want to delete <strong>{currentRow.name}</strong>?
					<br />
					This action cannot be undone. The celebrity image will also be removed
					from storage.
				</span>
			}
			confirmText="Delete"
			destructive
		>
			<Label className="my-2">
				Type celebrity name to confirm:
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={currentRow.name}
					className="mt-1"
				/>
			</Label>
			<Alert variant="destructive">
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>
					This will permanently delete the celebrity and all associated data.
				</AlertDescription>
			</Alert>
		</ConfirmDialog>
	);
}
