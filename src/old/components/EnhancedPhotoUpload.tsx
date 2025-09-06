/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
/** biome-ignore-all lint/a11y/noRedundantAlt: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Image, RotateCcw, Sparkles, Upload, Zap } from "lucide-react";
import { type SetStateAction, useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SimpleProgressBar } from "@/components/ui/progress-indicator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ImageProcessor } from "../lib/imageUtils";
import { storage } from "../lib/storage";

interface EnhancedPhotoUploadProps {
	onPhotoUpload: (photo: string, gender: string) => void;
	userPhoto?: { photo: string; gender: string };
}

export const EnhancedPhotoUpload = ({
	onPhotoUpload,
	userPhoto,
}: EnhancedPhotoUploadProps) => {
	const [selectedGender, setSelectedGender] = useState<string>(
		userPhoto?.gender || "",
	);
	const [dragActive, setDragActive] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [showFilters, setShowFilters] = useState(false);
	const [currentFilter, setCurrentFilter] = useState<
		"none" | "vintage" | "bw" | "sepia" | "vibrant"
	>("none");
	const [compressionLevel, setCompressionLevel] = useState([80]);
	const [originalImage, setOriginalImage] = useState<string>("");
	const [filteredImage, setFilteredImage] = useState<string>("");

	const inputRef = useRef<HTMLInputElement>(null);

	const processPhotoUpload = useCallback(
		async (file: File) => {
			if (!selectedGender) {
				return;
			}

			setIsUploading(true);
			setUploadProgress(0);

			try {
				// Simulate processing steps
				const steps = [
					{ name: "Compressing image", progress: 25 },
					{ name: "Optimizing quality", progress: 50 },
					{ name: "Applying enhancements", progress: 75 },
					{ name: "Finalizing", progress: 100 },
				];

				for (const step of steps) {
					setUploadProgress(step.progress);
					await new Promise((resolve) => setTimeout(resolve, 300));
				}

				// Compress image
				const quality = compressionLevel[0] / 100;
				const compressedBlob = await ImageProcessor.compressImage(file, {
					maxWidth: 1200,
					maxHeight: 1200,
					quality,
					format: "image/jpeg",
				});

				const dataUrl = await ImageProcessor.blobToDataUrl(compressedBlob);

				setOriginalImage(dataUrl);
				setFilteredImage(dataUrl);

				// Track the upload
				storage.trackEvent("photo_uploaded", {
					fileSize: file.size,
					compressionQuality: quality,
					gender: selectedGender,
				});

				onPhotoUpload(dataUrl, selectedGender);
			} catch (error) {
				console.error("Upload failed:", error);
			} finally {
				setIsUploading(false);
				setUploadProgress(0);
			}
		},
		[selectedGender, compressionLevel, onPhotoUpload],
	);

	const applyFilter = async (filter: typeof currentFilter) => {
		if (!originalImage) return;

		setCurrentFilter(filter);

		try {
			const filtered = await ImageProcessor.applyFilter(originalImage, filter);
			setFilteredImage(filtered);
			onPhotoUpload(filtered, selectedGender);
		} catch (error) {
			console.error("Filter failed:", error);
		}
	};

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setDragActive(false);

			const files = Array.from(e.dataTransfer.files);
			const imageFile = files.find((file) => file.type.startsWith("image/"));

			if (imageFile && selectedGender) {
				processPhotoUpload(imageFile);
			}
		},
		[selectedGender, processPhotoUpload],
	);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			processPhotoUpload(file);
		}
	};

	const resetPhoto = () => {
		setOriginalImage("");
		setFilteredImage("");
		setCurrentFilter("none");
		onPhotoUpload("", "");
		storage.trackEvent("photo_reset");
	};

	if (userPhoto) {
		return (
			<Card className="p-6 bg-gradient-card border-0 shadow-soft">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className="text-center space-y-4"
				>
					<div className="relative inline-block">
						<img
							src={userPhoto.photo}
							alt="Your photo"
							className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-match"
						/>
						<Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
							{userPhoto.gender === "male" ? "👨" : "👩"}
						</Badge>
					</div>

					<div className="flex gap-3 justify-center">
						<Dialog open={showFilters} onOpenChange={setShowFilters}>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm" className="gap-2">
									<Sparkles className="w-4 h-4" />
									Filters
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>Photo Filters</DialogTitle>
								</DialogHeader>

								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-2">
										{(
											["none", "vintage", "bw", "sepia", "vibrant"] as const
										).map((filter) => (
											<Button
												key={filter}
												variant={
													currentFilter === filter ? "default" : "outline"
												}
												size="sm"
												onClick={() => applyFilter(filter)}
												className="capitalize"
											>
												{filter === "none" ? "Original" : filter}
											</Button>
										))}
									</div>

									<div className="space-y-2">
										<Label>Compression Quality: {compressionLevel[0]}%</Label>
										<Slider
											value={compressionLevel}
											onValueChange={setCompressionLevel}
											max={100}
											min={10}
											step={10}
											className="w-full"
										/>
									</div>
								</div>
							</DialogContent>
						</Dialog>

						<Button
							variant="outline"
							size="sm"
							onClick={resetPhoto}
							className="gap-2"
						>
							<RotateCcw className="w-4 h-4" />
							Change Photo
						</Button>
					</div>
				</motion.div>
			</Card>
		);
	}

	return (
		<Card className="p-6 bg-gradient-card border-0 shadow-soft">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-6"
			>
				<div className="text-center">
					<h3 className="text-xl font-semibold text-foreground mb-2">
						Upload Your Photo
					</h3>
					<p className="text-muted-foreground text-sm">
						Start by selecting your gender and uploading a clear photo
					</p>
				</div>

				{/* Gender Selection */}
				<div className="space-y-3">
					<Label className="text-sm font-medium">Select your gender:</Label>
					<RadioGroup
						value={selectedGender}
						onValueChange={(value: SetStateAction<string>) => {
							setSelectedGender(value);
						}}
						className="flex gap-6 justify-center"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="male" id="male" />
							<Label htmlFor="male" className="cursor-pointer">
								👨 Male
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="female" id="female" />
							<Label htmlFor="female" className="cursor-pointer">
								👩 Female
							</Label>
						</div>
					</RadioGroup>
				</div>

				{/* Upload Area */}
				<AnimatePresence>
					{selectedGender && !isUploading && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="space-y-4"
						>
							<div className="flex gap-3 justify-center">
								<Button
									onClick={() => {
										inputRef.current?.click();
									}}
									className="gap-2 bg-gradient-primary hover:opacity-90 text-white border-0"
								>
									<Image className="w-4 h-4" />
									Photo Library
								</Button>

								<Button
									variant="outline"
									className="gap-2"
									onClick={() => {
										// In a real app, this would trigger camera
										inputRef.current?.click();
									}}
								>
									<Camera className="w-4 h-4" />
									Camera
								</Button>
							</div>

							<div
								className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
									dragActive
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-primary/50"
								}`}
								onDragEnter={() => setDragActive(true)}
								onDragLeave={() => setDragActive(false)}
								onDragOver={(e) => e.preventDefault()}
								onDrop={handleDrop}
							>
								<Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									{dragActive
										? "Drop your photo here!"
										: "Or drag and drop a photo here"}
								</p>
							</div>

							<input
								ref={inputRef}
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="hidden"
							/>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Upload Progress */}
				<AnimatePresence>
					{isUploading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							<SimpleProgressBar
								progress={uploadProgress}
								className="space-y-2"
							/>
							<div className="flex items-center justify-center gap-2 mt-3">
								<Zap className="w-4 h-4 text-primary animate-pulse" />
								<span className="text-sm text-muted-foreground">
									Optimizing your photo...
								</span>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{!selectedGender && (
					<div className="text-center py-4">
						<p className="text-sm text-muted-foreground">
							👆 Please select your gender first
						</p>
					</div>
				)}
			</motion.div>
		</Card>
	);
};
