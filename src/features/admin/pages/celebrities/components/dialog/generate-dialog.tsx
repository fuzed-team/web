"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
	AlertCircle,
	CheckCircle2,
	Download,
	Loader,
	Sparkles,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { TextLoop } from "@/components/motion-primitives/text-loop";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { type TMDBCelebrity, useFetchTMDB } from "../../api/fetch-tmdb";
import { useProcessCelebrity } from "../../api/process-celebrity";
import { useCelebrity } from "../../context/celebrity-context";

interface ProcessingResult {
	name: string;
	status: "success" | "error" | "skipped";
	error?: string;
	message?: string;
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
			setProcessingIndex(i);
			const celeb = selected[i];

			try {
				const result = await processCelebrity.mutateAsync({
					name: celeb.name,
					bio: celeb.bio,
					category: celeb.category,
					gender: celeb.gender === 1 ? "female" : "male",
					imageUrl: celeb.imageUrl,
				});

				if (result.skipped) {
					setResults((prev) => [
						...prev,
						{
							name: celeb.name,
							status: "skipped",
							message: result.message || "Already exists",
						},
					]);
				} else {
					setResults((prev) => [
						...prev,
						{ name: celeb.name, status: "success" },
					]);
				}
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

	const getProcessingName = () =>
		"Processing " +
		(celebrities.find((_, i) => i === processingIndex)?.name || "...");

	const successCount = results.filter((r) => r.status === "success").length;
	const skippedCount = results.filter((r) => r.status === "skipped").length;
	const errorCount = results.filter((r) => r.status === "error").length;

	return (
		<Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
			<DialogContent className="sm:max-w-7xl min-w-lg w-fit max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
				<DialogHeader className="p-6 pb-4 border-b">
					<DialogTitle>
						{step === "configure" && "Generate New Celebrities"}
						{step === "preview" && "Preview & Select"}
						{step === "processing" && "Processing"}
						{step === "complete" && "Complete!"}
					</DialogTitle>
					<DialogDescription>
						{step === "configure" &&
							"Fetch celebrities from TMDB API and process them with AI"}
						{step === "preview" &&
							`${selectedCount} of ${celebrities.length} celebrities selected`}
						{step === "processing" &&
							`Processing ${processingIndex + 1} of ${selectedCount}`}
						{step === "complete" &&
							`${successCount} succeeded, ${skippedCount} skipped, ${errorCount} failed`}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
					{step === "configure" && (
						<div className="p-6 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="count">Number of celebrities to fetch</Label>
								<Input
									id="count"
									type="number"
									min={1}
									max={100}
									value={count}
									onChange={(e) => {
										const val = Number(e.target.value);
										if (val > 100) setCount(100);
										else if (val < 0) setCount(1);
										else setCount(val);
									}}
								/>
								<p className="text-xs text-muted-foreground">
									Fetches popular celebrities from TMDB. Max 100.
								</p>
							</div>

							{error && (
								<div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
									<AlertCircle className="size-4" />
									{error}
								</div>
							)}
						</div>
					)}

					{step === "preview" && (
						<div className="w-[1268px]">
							<div className="flex items-center justify-between px-6 py-3 border-b bg-muted/5 sticky top-0 z-10 backdrop-blur-sm">
								<div className="flex items-center gap-2">
									<Checkbox
										checked={selectedCount === celebrities.length}
										onCheckedChange={(checked) => toggleAll(!!checked)}
									/>
									<span className="text-sm font-medium">Select all</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => toggleAll(false)}
									className="text-muted-foreground hover:text-foreground"
								>
									<Trash2 className="size-4 mr-1" />
									Clear selection
								</Button>
							</div>
							<ScrollArea className="flex-1">
								<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 p-6">
									{celebrities.map((celeb) => (
										<button
											type="button"
											key={celeb.id}
											className={`group relative rounded-xl border p-2 cursor-pointer transition-all text-left hover:shadow-md ${
												celeb.selected
													? "border-primary bg-primary/5 ring-1 ring-primary"
													: "border-border hover:border-muted-foreground/50"
											}`}
											onClick={() => toggleSelection(celeb.id)}
										>
											<div className="absolute top-3 left-3 z-10">
												<Checkbox
													checked={celeb.selected}
													className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
												/>
											</div>
											{celeb.profile_path ? (
												<div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-3">
													<Image
														src={celeb.imageUrl}
														alt={celeb.name}
														fill
														className="object-cover transition-transform duration-300 group-hover:scale-105"
													/>
												</div>
											) : (
												<div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center mb-3">
													<span className="text-muted-foreground text-xs">
														No image
													</span>
												</div>
											)}
											<div className="space-y-1">
												<p className="text-sm font-semibold truncate text-foreground">
													{celeb.name}
												</p>
												<p className="text-xs text-muted-foreground capitalize">
													{celeb.category}
												</p>
											</div>
										</button>
									))}
								</div>
							</ScrollArea>
						</div>
					)}

					{step === "processing" && (
						<div className="p-8 flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
							<AnimatedCircularProgressBar
								max={selectedCount}
								min={0}
								value={processingIndex}
								gaugePrimaryColor="var(--primary)"
								gaugeSecondaryColor="var(--muted)"
							/>
							<div className="text-center space-y-2">
								<TextShimmer
									className="text-sm text-muted-foreground"
									duration={1}
								>
									{getProcessingName()}
								</TextShimmer>
								<p className="text-xs text-muted-foreground">
									<TextLoop
										className="overflow-y-clip"
										transition={{
											type: "spring",
											stiffness: 900,
											damping: 80,
											mass: 10,
										}}
										variants={{
											initial: {
												y: 20,
												rotateX: 90,
												opacity: 0,
												filter: "blur(4px)",
											},
											animate: {
												y: 0,
												rotateX: 0,
												opacity: 1,
												filter: "blur(0px)",
											},
											exit: {
												y: -20,
												rotateX: -90,
												opacity: 0,
												filter: "blur(4px)",
											},
										}}
									>
										<span>extracting facial features...</span>
										<span>generating embeddings...</span>
									</TextLoop>
								</p>
							</div>
						</div>
					)}

					{step === "complete" && (
						<div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-[300px]">
							<div className="rounded-full bg-green-500/10 p-4">
								<CheckCircle2 className="size-16 text-green-500" />
							</div>
							<div className="text-center space-y-1">
								<h3 className="text-xl font-bold">Processing Complete!</h3>
								<p className="text-muted-foreground">
									Successfully added{" "}
									<span className="font-medium text-foreground">
										{successCount}
									</span>{" "}
									new celebrities.
								</p>
							</div>
							{skippedCount > 0 && (
								<div className="w-full max-w-md rounded-lg border bg-yellow-500/5 p-4 mt-4">
									<p className="text-sm font-medium text-yellow-600 mb-3 flex items-center gap-2">
										<AlertCircle className="size-4" />
										{skippedCount} skipped:
									</p>
									<ScrollArea className="h-24 pr-4">
										<div className="space-y-2">
											{results
												.filter((r) => r.status === "skipped")
												.map((r, i) => (
													<div
														key={i}
														className="text-xs text-yellow-600/80 flex gap-2"
													>
														<span className="font-medium">{r.name}:</span>
														<span>{r.message}</span>
													</div>
												))}
										</div>
									</ScrollArea>
								</div>
							)}
							{errorCount > 0 && (
								<div className="w-full max-w-md rounded-lg border bg-destructive/5 p-4 mt-4">
									<p className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
										<AlertCircle className="size-4" />
										{errorCount} failures occurred:
									</p>
									<ScrollArea className="h-32 pr-4">
										<div className="space-y-2">
											{results
												.filter((r) => r.status === "error")
												.map((r, i) => (
													<div
														key={i}
														className="text-xs text-destructive/80 flex gap-2"
													>
														<span className="font-medium">{r.name}:</span>
														<span>{r.error}</span>
													</div>
												))}
										</div>
									</ScrollArea>
								</div>
							)}
						</div>
					)}
				</div>

				<DialogFooter className="p-6 pt-4 border-t bg-background">
					{step === "configure" && (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={handleFetch} disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader className="size-4 animate-spin" />
										Fetching...
									</>
								) : (
									<>
										<Download className="size-4" />
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
							<Button
								onClick={handleProcess}
								disabled={selectedCount === 0}
								className="min-w-[200px]"
							>
								<Sparkles className="size-4" />
								Process {selectedCount} Celebrities
							</Button>
						</>
					)}
					{step === "complete" && (
						<Button onClick={handleClose} className="min-w-[100px]">
							Done
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
