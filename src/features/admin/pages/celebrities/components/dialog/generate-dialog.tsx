"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Download,
	Loader2,
	Sparkles,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type TMDBCelebrity, useFetchTMDB } from "../../api/fetch-tmdb";
import { useProcessCelebrity } from "../../api/process-celebrity";
import { useCelebrity } from "../../context/celebrity-context";

interface ProcessingResult {
	name: string;
	status: "success" | "error" | "skipped";
	error?: string;
}

type StepType = "configure" | "preview" | "processing" | "complete";

export function GenerateDialog() {
	const { open, setOpen } = useCelebrity();
	const queryClient = useQueryClient();

	const [step, setStep] = useState<StepType>("configure");
	const [count, setCount] = useState(20);
	const [celebrities, setCelebrities] = useState<
		(TMDBCelebrity & { selected: boolean })[]
	>([]);
	const [processingIndex, setProcessingIndex] = useState(0);
	const [results, setResults] = useState<ProcessingResult[]>([]);
	const [error, setError] = useState<string | null>(null);

	const fetchTMDB = useFetchTMDB();
	const isLoading = fetchTMDB.isPending;
	const isOpen = open === "generate";

	const handleClose = () => {
		setOpen(null);
		setTimeout(() => {
			setStep("configure");
			setCelebrities([]);
			setResults([]);
			setProcessingIndex(0);
			setError(null);
		}, 200);
	};

	const handleFetch = () => {
		fetchTMDB.mutate(count, {
			onSuccess: (data) => {
				setCelebrities(data.celebrities.map((c) => ({ ...c, selected: true })));
				setStep("preview");
			},
			onError: (err) => {
				setError(err instanceof Error ? err.message : "Unknown error");
			},
		});
	};

	const toggleSelection = (id: number) => {
		setCelebrities((prev) =>
			prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
		);
	};

	const toggleAll = (selected: boolean) => {
		setCelebrities((prev) => prev.map((c) => ({ ...c, selected })));
	};

	const selectedCount = celebrities.filter((c) => c.selected).length;

	const processCelebrity = useProcessCelebrity();

	const handleProcess = async () => {
		setStep("processing");
		setResults([]);
		setProcessingIndex(0);

		const selected = celebrities.filter((c) => c.selected);

		for (let i = 0; i < selected.length; i++) {
			setProcessingIndex(i + 1);
			const celeb = selected[i];

			try {
				await processCelebrity.mutateAsync({
					name: celeb.name,
					bio: celeb.bio,
					category: celeb.category,
					gender: celeb.gender === 1 ? "female" : "male",
					imageUrl: celeb.imageUrl,
				});
				setResults((prev) => [
					...prev,
					{ name: celeb.name, status: "success" },
				]);
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : "Unknown error";
				setResults((prev) => [
					...prev,
					{ name: celeb.name, status: "error", error: errorMessage },
				]);
			}
		}

		setStep("complete");
		queryClient.invalidateQueries({ queryKey: ["celebrities", "list"] });
		queryClient.invalidateQueries({ queryKey: ["admin-featured-celebrities"] });
	};

	const successCount = results.filter((r) => r.status === "success").length;
	const errorCount = results.filter((r) => r.status === "error").length;

	return (
		<Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{step === "configure" && "Generate New Celebrities"}
						{step === "preview" && "Preview & Select"}
						{step === "processing" && "Processing..."}
						{step === "complete" && "Complete!"}
					</DialogTitle>
					<DialogDescription>
						{step === "configure" &&
							"Fetch celebrities from TMDB API and process them with AI"}
						{step === "preview" &&
							`${selectedCount} of ${celebrities.length} celebrities selected`}
						{step === "processing" &&
							`Processing ${processingIndex} of ${selectedCount}...`}
						{step === "complete" &&
							`${successCount} succeeded, ${errorCount} failed`}
					</DialogDescription>
				</DialogHeader>

				{step === "configure" && (
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="count">Number of celebrities to fetch</Label>
							<Input
								id="count"
								type="number"
								min={1}
								max={100}
								value={count}
								onChange={(e) => setCount(Number(e.target.value))}
							/>
							<p className="text-xs text-muted-foreground">
								Fetches popular celebrities from TMDB. Max 100.
							</p>
						</div>

						{error && (
							<div className="flex items-center gap-2 text-destructive text-sm">
								<AlertCircle className="size-4" />
								{error}
							</div>
						)}
					</div>
				)}

				{step === "preview" && (
					<>
						<div className="flex items-center justify-between py-2 border-b">
							<div className="flex items-center gap-2">
								<Checkbox
									checked={selectedCount === celebrities.length}
									onCheckedChange={(checked) => toggleAll(!!checked)}
								/>
								<span className="text-sm">Select all</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => toggleAll(false)}
							>
								<Trash2 className="size-4 mr-1" />
								Clear selection
							</Button>
						</div>
						<ScrollArea className="flex-1 max-h-[400px]">
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
								{celebrities.map((celeb) => (
									<button
										type="button"
										key={celeb.id}
										className={`relative rounded-lg border p-2 cursor-pointer transition-colors text-left ${
											celeb.selected
												? "border-primary bg-primary/5"
												: "border-muted hover:border-muted-foreground/50"
										}`}
										onClick={() => toggleSelection(celeb.id)}
									>
										<div className="absolute top-2 left-2 z-10">
											<Checkbox checked={celeb.selected} />
										</div>
										{celeb.profile_path ? (
											<div className="relative aspect-square rounded-md overflow-hidden bg-muted mb-2">
												<Image
													src={celeb.imageUrl}
													alt={celeb.name}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="aspect-square rounded-md bg-muted flex items-center justify-center mb-2">
												<span className="text-muted-foreground text-xs">
													No image
												</span>
											</div>
										)}
										<p className="text-sm font-medium truncate">{celeb.name}</p>
										<p className="text-xs text-muted-foreground capitalize">
											{celeb.category}
										</p>
									</button>
								))}
							</div>
						</ScrollArea>
					</>
				)}

				{step === "processing" && (
					<div className="py-8 space-y-6">
						<div className="space-y-2">
							<Progress value={(processingIndex / selectedCount) * 100} />
							<p className="text-center text-sm text-muted-foreground">
								Processing{" "}
								{celebrities.find((_, i) => i === processingIndex - 1)?.name ||
									"..."}
							</p>
						</div>
						<div className="flex justify-center">
							<Loader2 className="size-8 animate-spin text-primary" />
						</div>
						<p className="text-center text-xs text-muted-foreground">
							Extracting facial features and uploading to database...
						</p>
					</div>
				)}

				{step === "complete" && (
					<div className="py-6 space-y-4">
						<div className="flex justify-center">
							<CheckCircle2 className="size-16 text-green-500" />
						</div>
						<div className="text-center">
							<p className="text-lg font-semibold">Processing Complete!</p>
							<p className="text-muted-foreground">
								{successCount} celebrities added successfully
							</p>
						</div>
						{errorCount > 0 && (
							<div className="max-h-32 overflow-auto rounded border p-2">
								<p className="text-sm font-medium text-destructive mb-2">
									{errorCount} failed:
								</p>
								{results
									.filter((r) => r.status === "error")
									.map((r, i) => (
										<p key={i} className="text-xs text-muted-foreground">
											• {r.name}: {r.error}
										</p>
									))}
							</div>
						)}
					</div>
				)}

				<DialogFooter>
					{step === "configure" && (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={handleFetch} disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="size-4 mr-2 animate-spin" />
										Fetching...
									</>
								) : (
									<>
										<Download className="size-4 mr-2" />
										Fetch from TMDB
									</>
								)}
							</Button>
						</>
					)}
					{step === "preview" && (
						<>
							<Button variant="outline" onClick={() => setStep("configure")}>
								Back
							</Button>
							<Button onClick={handleProcess} disabled={selectedCount === 0}>
								<Sparkles className="size-4 mr-2" />
								Process {selectedCount} Celebrities
							</Button>
						</>
					)}
					{step === "complete" && <Button onClick={handleClose}>Done</Button>}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
