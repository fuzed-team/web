"use client";

import { motion } from "framer-motion";
import { Loader, Plus } from "lucide-react";
import React from "react";
import { BorderBeam } from "@/app/(landing-page)/_components/ui/border-beam";
import { BlurImage } from "@/components/blur-image";
import {
	FileUpload,
	type FileUploadRef,
} from "@/components/kokonutui/file-upload";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { SortByOption } from "@/features/matching/api/get-user-match";

import { cn } from "@/lib/utils";
import { useUploadFace } from "../../api/upload-face";
import { base64ToFile } from "../../utils";
import { ImageCropDialog } from "../upload-photo/image-crop-dialog";
import { PhotoFilterSkeleton } from "../user-match/photo-filter-skeleton";

const SORT_OPTIONS: { value: SortByOption; label: string }[] = [
	{ value: "highest_percentage", label: "Highest %" },
	{ value: "lowest_percentage", label: "Lowest %" },
	{ value: "newest", label: "Newest" },
	{ value: "oldest", label: "Oldest" },
];

interface PhotoSelectorProps {
	activePhotoId: string | null;
	onPhotoSelect: (photoId: string | null) => void;
	sortBy: SortByOption;
	onSortChange: (sortBy: SortByOption) => void;
	className?: string;
	userPhotos: any[];
	isLoading: boolean;
}

export function PhotoSelector({
	activePhotoId,
	onPhotoSelect,
	sortBy,
	onSortChange,
	className,
	userPhotos,
	isLoading,
}: PhotoSelectorProps) {
	const fileUploadRef = React.useRef<FileUploadRef>(null);
	// const { data: userPhotosData, isLoading } = useUserPhotos();
	const uploads = userPhotos ?? [];

	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const [showCropDialog, setShowCropDialog] = React.useState(false);

	const uploadFaceMutation = useUploadFace({
		mutationConfig: {
			onSuccess: (data) => {
				setSelectedFile(null);
				fileUploadRef.current?.reset();
				onPhotoSelect(data.id);
			},
			onError: () => {
				setSelectedFile(null);
				fileUploadRef.current?.reset();
			},
		},
	});
	const isUploading = uploadFaceMutation.isPending;

	const handleFileSelected = (file: File) => {
		setSelectedFile(file);
		setShowCropDialog(true);
	};

	const handleCropComplete = async (croppedImageBase64: string) => {
		if (uploadFaceMutation.isPending) return;

		try {
			const croppedFile = await base64ToFile(
				croppedImageBase64,
				selectedFile?.name || "cropped-image.png",
			);

			setShowCropDialog(false);
			uploadFaceMutation.mutate({ file: croppedFile });
		} catch (error) {
			console.error("Failed to process cropped image:", error);
			setShowCropDialog(false);
			setSelectedFile(null);
			fileUploadRef.current?.reset();
			// TODO: Show error toast to user
		}
	};
	const handleCancelCrop = () => {
		setShowCropDialog(false);
		setSelectedFile(null);
		fileUploadRef.current?.reset();
	};

	const handleChangePhoto = () => {
		fileUploadRef.current?.triggerFileInput();
	};

	const handleSelectFile = () => {};

	const handleTabClick = (photoId: string | null) => {
		onPhotoSelect(photoId);
	};

	// Show skeleton while loading
	if (isLoading) {
		return <PhotoFilterSkeleton className={className} />;
	}

	return (
		<motion.header
			initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
			animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
			transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
			className="mb-6"
		>
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
				<div>
					<h2 className="md:text-2xl text-xl font-semibold tracking-tight text-foreground">
						Matches for{" "}
						<span className="bg-gradient-to-r bg-clip-text text-transparent from-primary to-purple-600">
							Portrait #
							{uploads.findIndex((u: any) => u.id === activePhotoId) + 1}
						</span>
					</h2>
					<p className="text-muted-foreground mt-1">
						Select a photo below to see who matches with it.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="relative top-[1px] text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Sort by:
					</span>
					<Select
						value={sortBy}
						onValueChange={(value) => onSortChange(value as SortByOption)}
					>
						<SelectTrigger className="w-[130px] h-8 text-sm border-none bg-transparent shadow-none">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
				animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
				transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
				className="relative group mb-6"
			>
				<div className="flex overflow-x-auto gap-3 py-4 snap-x-mandatory hide-scrollbar">
					{/* Add New */}
					<div className="flex-shrink-0 snap-center">
						<button
							type="button"
							disabled={isUploading}
							className={cn(
								"w-20 h-24 md:w-24 md:h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground transition-all group-hover:scale-100",
								isUploading
									? "opacity-50 cursor-not-allowed"
									: "hover:border-primary hover:text-primary hover:bg-primary/10",
							)}
							onClick={handleChangePhoto}
						>
							<Plus className="w-6 h-6" />
							<span className="text-xs font-medium">Add Photo</span>
						</button>
					</div>
					{isUploading && (
						<div className="flex-shrink-0 snap-center">
							<div className="relative w-20 h-24 md:w-24 md:h-32 rounded-xl border border-border flex items-center justify-center bg-muted/50 animate-pulse">
								<Loader className="w-6 h-6 animate-spin text-muted-foreground" />
								<BorderBeam size={40} duration={2} borderWidth={1} />
							</div>
						</div>
					)}
					<FileUpload
						ref={fileUploadRef}
						onUploadSuccess={handleFileSelected}
						onSelectFile={handleSelectFile}
						acceptedFileTypes={["image/*"]}
						maxFileSize={10 * 1024 * 1024} // 10MB
						uploadDelay={100}
						validateFile={() => null}
						classes={{ container: "hidden" }}
					/>

					{uploads.map((upload, i) => {
						const isActive = activePhotoId === upload.id;
						return (
							// biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<div
								key={upload.id}
								className={cn(
									"flex-shrink-0 relative snap-center cursor-pointer  hover:opacity-100 transition-opacity",
									isActive ? "opacity-100" : "opacity-60",
								)}
								onClick={() => handleTabClick(upload.id)}
							>
								{/* {isActive && (
									<div className="absolute -top-2 -right-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm bg-primary text-primary-foreground">
										Selected
									</div>
								)} */}
								<div
									className={cn(
										"w-20 h-24 md:w-24 md:h-32 rounded-xl overflow-hidden border border-border",
										isActive
											? "p-0.5 bg-gradient-to-br from-primary shadow-lg shadow-primary/25 ring-2 ring-offset-2 ring-offset-background ring-primary/50 to-purple-600"
											: "border-border opacity-60 hover:opacity-100",
									)}
								>
									<BlurImage
										src={upload.image_url}
										alt={`Photo ${i + 1}`}
										className="w-full h-full object-cover rounded-xl"
										width={100}
										height={128}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</motion.div>
			<ImageCropDialog
				open={showCropDialog}
				file={selectedFile}
				onCancelCrop={handleCancelCrop}
				onCrop={handleCropComplete}
				onOpenChange={setShowCropDialog}
			/>
		</motion.header>
	);
}
