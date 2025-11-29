"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFlagUser } from "@/features/chat/api/flag-user";

interface FlagUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userId: string;
	userName: string;
}

export function FlagUserDialog({
	open,
	onOpenChange,
	userId,
	userName,
}: FlagUserDialogProps) {
	const [reason, setReason] = useState("");

	const flagUserMutation = useFlagUser({
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
				setReason("");
			},
		},
	});

	const handleFlag = () => {
		if (reason.trim().length < 10) return;
		if (flagUserMutation.isPending) return;
		flagUserMutation.mutate({
			reported_user_id: userId,
			reason: reason.trim(),
		});
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				onOpenChange(open);
				if (!open) setReason("");
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Flag User</DialogTitle>
					<DialogDescription>
						Report {userName} for inappropriate behavior. Our team will review
						your report.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="reason">Reason for flagging</Label>
						<Textarea
							id="reason"
							placeholder="Please describe the issue (minimum 10 characters)..."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							rows={4}
							className="resize-none"
						/>
						<p className="text-sm text-muted-foreground">
							{reason.length}/10 characters minimum
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={flagUserMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleFlag}
						disabled={reason.trim().length < 10 || flagUserMutation.isPending}
					>
						{flagUserMutation.isPending ? "Flagging..." : "Flag User"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
