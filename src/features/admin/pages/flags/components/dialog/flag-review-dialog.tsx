"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import type { UserFlag } from "@/types/api";
import { useUpdateFlag } from "../../api/update-flag";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	flag: UserFlag;
	action: "reviewed" | "dismissed";
}

export function FlagReviewDialog({ open, onOpenChange, flag, action }: Props) {
	const updateFlagMutation = useUpdateFlag({
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	});

	const handleConfirm = () => {
		if (updateFlagMutation.isPending) return;
		updateFlagMutation.mutate({
			id: flag.id,
			status: action,
		});
	};

	const isReview = action === "reviewed";

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleConfirm}
			isLoading={updateFlagMutation.isPending}
			title={isReview ? "Mark Flag as Reviewed" : "Dismiss Flag"}
			desc={
				<span>
					Are you sure you want to mark this flag as <strong>{action}</strong>?
					<br />
					{isReview
						? "This indicates you have taken necessary action."
						: "This indicates the report was invalid or requires no action."}
				</span>
			}
			confirmText={isReview ? "Mark Reviewed" : "Dismiss Flag"}
			destructive={!isReview}
		>
			<div className="mt-4 space-y-4">
				<div className="rounded-md border p-4">
					<div className="mb-2 grid grid-cols-[100px_1fr] gap-2 text-sm">
						<span className="font-medium text-muted-foreground">Reporter:</span>
						<span>{flag.reporter.name}</span>

						<span className="font-medium text-muted-foreground">Reported:</span>
						<span>{flag.reported_user.name}</span>

						<span className="font-medium text-muted-foreground">Reason:</span>
						<span>{flag.reason}</span>
					</div>
				</div>
			</div>
		</ConfirmDialog>
	);
}
