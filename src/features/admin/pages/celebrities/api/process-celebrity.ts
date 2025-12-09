import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

export interface ProcessCelebrityInput {
	name: string;
	bio: string;
	category: string;
	gender: "male" | "female";
	imageUrl: string;
}

export interface ProcessCelebrityResult {
	success: boolean;
	name: string;
	quality?: number;
	skipped?: boolean;
	message?: string;
}

export const processCelebrity = async (
	input: ProcessCelebrityInput,
): Promise<ProcessCelebrityResult> => {
	return api.post("/admin/celebrities/process", input);
};

type UseProcessCelebrityOptions = {
	mutationConfig?: MutationConfig<typeof processCelebrity>;
};

export const useProcessCelebrity = ({
	mutationConfig,
}: UseProcessCelebrityOptions = {}) => {
	const { onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		mutationFn: processCelebrity,
		...restConfig,
		onError: (error: Error, ...args) => {
			const errorMessage =
				(error as any)?.message || "Failed to process celebrity";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
	});
};
