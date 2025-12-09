"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import type { CelebrityApi } from "../../api/get-celebrities";
import { useFeaturedCelebrities } from "../../api/get-featured-celebrities";
import { useSetFeaturedCelebrity } from "../../api/set-featured-celebrity";
import {
	getCelebrityImageUrl,
	getTimeLeft,
} from "../../utils/celebrity-helpers";
import { useCelebritiesSearchParams } from "../../utils/search-params";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	currentRow: CelebrityApi;
}

export function CelebritySetFeaturedDialog({
	open,
	onOpenChange,
	currentRow,
}: Props) {
	const urlParams = useCelebritiesSearchParams();
	const { data: featuredCelebrities } = useFeaturedCelebrities();

	const setFeaturedMutation = useSetFeaturedCelebrity({
		inputQuery: urlParams,
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	});

	const handleSetFeatured = () => {
		if (setFeaturedMutation.isPending) return;
		setFeaturedMutation.mutate({
			id: currentRow.id,
			is_featured: true,
			featured_duration_hours: 24,
		});
	};

	// Get current featured celebrity of same gender
	const currentFeatured =
		currentRow.gender === "male"
			? featuredCelebrities?.male
			: featuredCelebrities?.female;

	const isAlreadyFeatured = currentRow.is_featured;

	return (
		<ConfirmDialog
			isLoading={setFeaturedMutation.isPending}
			open={open}
			onOpenChange={onOpenChange}
			handleConfirm={handleSetFeatured}
			disabled={Boolean(isAlreadyFeatured)}
			title="Set as Featured Celebrity"
			desc={
				<span>
					Set <strong>{currentRow.name}</strong> as the featured{" "}
					{currentRow.gender} celebrity for the next 24 hours?
				</span>
			}
			confirmText={
				<span className="flex items-center gap-1">
					<Star className="size-4" />
					Set as Featured
				</span>
			}
		>
			<div className="my-4 space-y-4">
				{isAlreadyFeatured && (
					<Alert>
						<Star className="size-4" />
						<AlertTitle>Already Featured</AlertTitle>
						<AlertDescription>
							This celebrity is already featured. Time remaining:{" "}
							<strong>{getTimeLeft(currentRow.featured_until)}</strong>
						</AlertDescription>
					</Alert>
				)}

				{currentFeatured && currentFeatured.id !== currentRow.id && (
					<Alert variant="destructive">
						<AlertTitle className="flex items-center gap-2">
							<span>Current Featured ({currentRow.gender})</span>
						</AlertTitle>
						<AlertDescription>
							<div className="mt-2 flex items-center gap-3">
								<div className="relative size-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
									<Image
										src={getCelebrityImageUrl(currentFeatured.image_path)}
										alt={currentFeatured.name}
										fill
										className="object-cover"
									/>
								</div>
								<div>
									<p className="font-medium">{currentFeatured.name}</p>
									<p className="text-xs">
										Time left: {getTimeLeft(currentFeatured.featured_until)}
									</p>
								</div>
							</div>
							<p className="mt-2 text-sm">
								This celebrity will be <strong>replaced</strong> as featured.
							</p>
						</AlertDescription>
					</Alert>
				)}

				{/* Preview of celebrity being set */}
				<div className="rounded-lg border p-4">
					<p className="text-sm text-muted-foreground mb-2">
						Celebrity to be featured:
					</p>
					<div className="flex items-center gap-3">
						<div className="relative size-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
							<Image
								src={getCelebrityImageUrl(currentRow.image_path)}
								alt={currentRow.name}
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<p className="font-semibold">{currentRow.name}</p>
							<div className="flex items-center gap-2 mt-1">
								<Badge
									variant={
										currentRow.gender === "male" ? "default" : "secondary"
									}
								>
									{currentRow.gender}
								</Badge>
								<Badge variant="outline" className="capitalize">
									{currentRow.category}
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ConfirmDialog>
	);
}
