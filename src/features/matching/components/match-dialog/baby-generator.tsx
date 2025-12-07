"use client";

import { motion } from "framer-motion";
import {
	Dna,
	Download,
	Loader,
	Lock,
	Share2,
	Sparkles,
	Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BlurImage } from "@/components/blur-image";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useGenerateBaby } from "../../api/generate-baby";
import { useBabyForMatch } from "../../api/get-baby";
import { useMatchDetails } from "../../api/get-match-details";
import type { MatchMode } from "../../store/user-matches";
import { generateMatchMessage } from "../../utils/generate-match-message";

interface BabyGeneratorProps {
	matchId?: string;
	userPhoto?: string;
	matchPhoto?: string;
	userName?: string;
	matchName?: string;
	mode?: MatchMode;
	onBack?: () => void;
}

export const BabyGenerator = ({
	matchId,
	userPhoto,
	matchPhoto,
	userName,
	matchName,
	// mode = "own-match", // Unused in new design
	onBack,
}: BabyGeneratorProps) => {
	const router = useRouter();
	const [babyImage, setBabyImage] = useState<string>("");
	const [mutualConnection, setMutualConnection] = useState<{
		id: string;
		icebreaker: string;
	} | null>(null);
	const [showMutualDialog, setShowMutualDialog] = useState(false);

	// Fetch match details
	const { data: matchDetails } = useMatchDetails({
		matchId,
		queryConfig: { enabled: !!matchId },
	});

	const generateBabyMutation = useGenerateBaby({
		mutationConfig: {
			onSuccess: (data) => {
				if (!data?.image_url) {
					toast.error("Failed to generate baby image. Please try again! 😔");
					return;
				}
				setBabyImage(data.image_url);

				if (data.mutual_connection) {
					setMutualConnection(data.mutual_connection);
					setShowMutualDialog(true);
					const matchMessage = generateMatchMessage(
						matchDetails?.commonalities || [],
					);
					toast.success(`${matchMessage} Chat unlocked! 💬`);
				} else {
					toast.success("Baby generated! Notification sent. 👶");
				}
			},
		},
	});

	// Fetch existing baby
	const { data: existingBaby, isLoading: loadingExisting } = useBabyForMatch({
		matchId,
		queryConfig: { enabled: !!matchId },
	});

	useEffect(() => {
		if (existingBaby?.image_url) {
			setBabyImage(existingBaby.image_url);
		}
	}, [existingBaby]);

	const handleGenerate = async () => {
		if (generateBabyMutation.isPending) return;
		if (!matchId) {
			toast.error("Match ID is required to generate baby! 📸");
			return;
		}
		setBabyImage("");
		generateBabyMutation.mutate(matchId);
	};

	const shareBaby = async () => {
		if (!babyImage) return;
		const shareData = {
			title: `Our Future Baby! 👶`,
			text: `${matchName || "My match"} and I would make beautiful babies! 💕 #Fuzed`,
			url: window.location.href,
		};
		try {
			if (
				navigator.share &&
				navigator.canShare &&
				navigator.canShare(shareData)
			) {
				await navigator.share(shareData);
				toast.success("Baby shared successfully! 🎉");
			} else {
				await navigator.clipboard.writeText(
					`Check out what ${matchName || "my match"} and I would look like as parents! ${window.location.href}`,
				);
				toast.success("Link copied to clipboard! Share away! 📋");
			}
		} catch (_error) {
			toast.error("Unable to share. Try saving the image instead.");
		}
	};

	const saveBaby = async () => {
		if (!babyImage) return;
		try {
			const response = await fetch(babyImage);
			const blob = await response.blob();
			const link = document.createElement("a");
			link.download = `fuzed-baby-${matchName || "match"}.jpg`;
			link.href = URL.createObjectURL(blob);
			link.click();
			URL.revokeObjectURL(link.href);
			toast.success("Baby image saved! 💾");
		} catch (_error) {
			toast.error("Unable to save image");
		}
	};

	const isGenerating = generateBabyMutation.isPending || loadingExisting;

	return (
		<>
			<div className="relative w-full flex flex-col items-center transition-all duration-300 overflow-hidden font-sans">
				{/* Top Gradient Accents */}
				<div className="absolute top-0 inset-x-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background/0 to-background/0 pointer-events-none"></div>

				{/* Close Button */}
				{/* {onBack && (
					<button
						type="button"
						onClick={onBack}
						className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 border border-transparent transition-all z-30"
					>
						<X className="w-4 h-4" />
					</button>
				)} */}

				{/* Card Content */}
				<div className="relative z-10 w-full flex flex-col">
					{/* Header */}
					<div className="px-6 sm:px-8 pt-8 pb-10 sm:pb-6 text-center">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold tracking-wider uppercase mb-3">
							<Sparkles className="w-3 h-3" /> AI Prediction 2.0
						</div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">
							Future Generator
						</h2>
						<p className="text-muted-foreground text-sm">
							Combining genetic features to predict your future.
						</p>
					</div>

					{/* The "Mixing Chamber" Visualization */}
					<div className="relative px-4 pb-8 w-full sm:w-[440px] mx-auto">
						{/* Connecting Lines (SVG) */}
						<svg
							className="absolute top-[28px] left-0 w-full h-[120px] z-0 pointer-events-none stroke-gray-200 dark:stroke-gray-700"
							fill="none"
							viewBox="0 0 440 120"
							preserveAspectRatio="none"
						>
							{/* Left path to center */}
							<path
								d="M 80 20 C 80 50, 220 20, 220 90"
								strokeWidth="1.5"
								strokeDasharray="4 4"
								className="opacity-80"
							></path>
							{/* Right path to center */}
							<path
								d="M 360 20 C 360 50, 220 20, 220 90"
								strokeWidth="1.5"
								strokeDasharray="4 4"
								className="opacity-80"
							></path>

							{/* Animated Flow (Only when generating) */}
							{isGenerating && (
								<>
									<path
										d="M 80 20 C 80 50, 220 20, 220 90"
										strokeWidth="1.5"
										strokeDasharray="4 4"
										className="stroke-blue-500 opacity-60 animate-[dash_1s_linear_infinite]"
									></path>
									<path
										d="M 360 20 C 360 50, 220 20, 220 90"
										strokeWidth="1.5"
										strokeDasharray="4 4"
										className="stroke-pink-500 opacity-60 animate-[dash_1s_linear_infinite]"
									></path>
								</>
							)}
						</svg>

						<div className="flex flex-col items-center gap-6 relative z-10">
							{/* Parents Row */}
							<div className="flex items-center justify-between w-full px-4 sm:px-8">
								{/* User */}
								<div className="flex flex-col items-center gap-2">
									<div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-b from-blue-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
										<div className="w-full h-full rounded-full p-[2px] bg-card overflow-hidden">
											{userPhoto ? (
												<BlurImage
													src={userPhoto}
													alt="You"
													width={64}
													height={64}
													className="w-full h-full rounded-full object-cover"
												/>
											) : (
												<div className="w-full h-full bg-muted rounded-full" />
											)}
										</div>
									</div>
									<span
										className="max-w-16 w-full truncate block text-center text-xs font-medium text-muted-foreground"
										title={userName || "You"}
									>
										{userName || "You"}
									</span>
								</div>

								{/* DNA Icon in Center */}
								<div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shadow-sm mt-[-20px] z-20">
									<Dna className="w-4 h-4" />
								</div>

								{/* Match */}
								<div className="flex flex-col items-center gap-2">
									<div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-b from-fuchsia-500 to-pink-600 shadow-lg shadow-pink-500/20">
										<div className="w-full h-full rounded-full p-[2px] bg-card overflow-hidden">
											{matchPhoto ? (
												<BlurImage
													src={matchPhoto}
													alt="Match"
													width={64}
													height={64}
													className="w-full h-full rounded-full object-cover"
												/>
											) : (
												<div className="w-full h-full bg-muted rounded-full" />
											)}
										</div>
									</div>
									<span
										className="max-w-16 w-full truncate block text-center text-xs font-medium text-muted-foreground"
										title={matchName || "Match"}
									>
										{matchName || "Match"}
									</span>
								</div>
							</div>

							{/* Result Placeholder / Actual Result */}
							<div
								className="relative group cursor-pointer mt-2"
								onClick={babyImage ? undefined : handleGenerate}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										if (!babyImage) handleGenerate();
									}
								}}
								role="button"
								tabIndex={0}
							>
								{/* Glowing background behind result */}
								<div
									className={`absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 rounded-full blur-xl transition-opacity ${babyImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
								></div>

								{babyImage ? (
									<motion.div
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										className="relative w-32 h-32 rounded-2xl p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl"
									>
										<div className="w-full h-full rounded-xl overflow-hidden bg-white relative">
											<BlurImage
												src={babyImage}
												alt="Predicted Baby"
												width={128}
												height={128}
												className="w-full h-full object-cover"
											/>
										</div>
										{/* Sparkle decoration */}
										<div className="absolute -top-2 -right-2 bg-card rounded-full p-1 shadow-md text-yellow-500 animate-bounce">
											<Sparkles className="w-4 h-4 fill-current" />
										</div>
									</motion.div>
								) : (
									/* Scanner Effect Border (Empty State) */
									<div
										className={`w-24 h-24 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden transition-colors shadow-inner ${isGenerating ? "border-indigo-400 dark:border-indigo-500" : "group-hover:border-indigo-200 dark:group-hover:border-indigo-600"}`}
									>
										{/* Animated Scan Line */}
										<div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[scan_2s_ease-in-out_infinite]"></div>

										{/* Icon */}
										<div className="flex flex-col items-center gap-1 opacity-50">
											{isGenerating ? (
												<div className="flex flex-col items-center animate-pulse">
													<Loader className="w-6 h-6 text-primary animate-spin" />
													<span className="text-[9px] font-bold uppercase tracking-widest text-primary mt-1">
														Scanning
													</span>
												</div>
											) : (
												<>
													<Lock className="w-6 h-6 text-gray-400" />
													<span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
														Hidden
													</span>
												</>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Action Footer */}
					<div className="p-5 bg-muted/30 border-t border-border">
						{babyImage ? (
							<div className="flex gap-3">
								<Button
									type="button"
									variant="card"
									onClick={shareBaby}
									className="flex-1 py-3 rounded-xl h-auto"
								>
									<Share2 className="w-4 h-4" />
									Share
								</Button>
								<Button
									type="button"
									onClick={saveBaby}
									className="flex-1 py-3 rounded-xl h-auto"
								>
									<Download className="w-4 h-4" />
									Save
								</Button>
							</div>
						) : (
							<button
								type="button"
								onClick={handleGenerate}
								disabled={isGenerating}
								className="group w-full py-3.5 relative rounded-xl overflow-hidden font-medium text-sm text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
							>
								{/* Button Background Gradient with Animation */}
								<div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-pink-600 animate-beam"></div>

								{/* Content */}
								<span className="relative z-10 flex items-center justify-center gap-2">
									{isGenerating ? (
										<>
											<Loader className="w-4 h-4 animate-spin" />
											Generating genetic prediction...
										</>
									) : (
										<>
											<Wand2 className="w-4 h-4" />
											Reveal Predicted Child
										</>
									)}
								</span>
							</button>
						)}
						<p className="text-[10px] text-muted-foreground text-center mt-3">
							Generative AI output is simulated for entertainment purposes.
						</p>
					</div>
				</div>
			</div>

			{/* Mutual Connection Celebration Dialog - kept from original */}
			<Dialog open={showMutualDialog} onOpenChange={setShowMutualDialog}>
				<DialogContent className="sm:max-w-md bg-white">
					<DialogHeader>
						<DialogTitle className="text-center text-2xl text-gray-900">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: "spring", stiffness: 200 }}
								className="flex flex-col items-center gap-2"
							>
								<div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-2">
									<span className="text-3xl">❤️</span>
								</div>
								<span>It's a Match!</span>
							</motion.div>
						</DialogTitle>
						<DialogDescription className="text-center space-y-4 pt-4">
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="space-y-2"
							>
								<p className="text-base text-gray-700 font-medium">
									{generateMatchMessage(matchDetails?.commonalities || [])}
								</p>
								<p className="text-sm text-gray-500">
									You both generated a baby together! 🎉 Chat unlocked.
								</p>
							</motion.div>
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex flex-col gap-2 sm:flex-col">
						<Button
							onClick={() => {
								if (mutualConnection?.id) {
									router.push(`/chat/${mutualConnection.id}`);
								}
							}}
							size="lg"
						>
							Start Chatting
						</Button>
						<Button variant="ghost" onClick={() => setShowMutualDialog(false)}>
							Maybe Later
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
