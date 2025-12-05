"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import React from "react";
import { BlurImage } from "@/components/blur-image";
import {
	FileUpload,
	type FileUploadRef,
} from "@/components/kokonutui/file-upload";
import { useUserPhotos } from "@/features/matching/api/get-user-photos";
import { cn } from "@/lib/utils";
import { useUploadFace } from "../../api/upload-face";
import { base64ToFile } from "../../utils";
import { ImageCropDialog } from "../upload-photo/image-crop-dialog";
import { PhotoFilterSkeleton } from "./photo-filter-skeleton";

interface PhotoSelectorProps {
	activePhotoId: string | null;
	onPhotoSelect: (photoId: string | null) => void;
	className?: string;
}

export function PhotoSelector({
	activePhotoId,
	onPhotoSelect,
	className,
}: PhotoSelectorProps) {
	const fileUploadRef = React.useRef<FileUploadRef>(null);
	const { data: userPhotosData, isLoading } = useUserPhotos();
	const uploads = userPhotosData?.faces ?? [];

	const [isUploading, setIsUploading] = React.useState<boolean>(false);
	const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
	const [showCropDialog, setShowCropDialog] = React.useState(false);

	const uploadFaceMutation = useUploadFace({
		mutationConfig: {
			onSuccess: () => {
				setIsUploading(false);
				setSelectedFile(null);
				fileUploadRef.current?.reset();
			},
			onError: () => {
				setSelectedFile(null);
				fileUploadRef.current?.reset();
			},
		},
	});

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
		setIsUploading(false);
		fileUploadRef.current?.reset();
	};

	const handleChangePhoto = () => {
		fileUploadRef.current?.triggerFileInput();
	};

	const handleSelectFile = () => {
		setIsUploading(true);
	};

	const handleTabClick = (photoId: string | null) => {
		onPhotoSelect(photoId);
	};

	React.useEffect(() => {
		if (
			userPhotosData?.faces &&
			userPhotosData.faces.length > 0 &&
			!activePhotoId
		) {
			onPhotoSelect(uploads[0].id);
		}
	}, [userPhotosData, activePhotoId, onPhotoSelect, uploads]);

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
							Portrait #1
						</span>
					</h2>
					<p className="text-muted-foreground mt-1">
						Select a photo below to see who matches with it.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Sort by:
					</span>
					<select className="bg-transparent text-sm font-medium border-none outline-none cursor-pointer focus:ring-0 text-foreground">
						<option>Highest %</option>
						<option>Newest</option>
						<option>Nearby</option>
					</select>
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
							className="w-20 h-24 md:w-24 md:h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all group-hover:scale-100"
							onClick={handleChangePhoto}
						>
							<Plus className="w-6 h-6" />
							<span className="text-xs font-medium">Add Photo</span>
						</button>
					</div>
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
								key={i}
								className={cn(
									"flex-shrink-0 relative snap-center cursor-pointer  hover:opacity-100 transition-opacity",
									isActive ? "opacity-100" : "opacity-60",
								)}
								onClick={() => handleTabClick(upload.id)}
							>
								{isActive && (
									<div className="absolute -top-2 -right-2 z-20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm bg-primary text-primary-foreground">
										Selected
									</div>
								)}
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
