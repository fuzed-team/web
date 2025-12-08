import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

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

export const useProcessCelebrity = () => {
	return useMutation({
		mutationFn: processCelebrity,
	});
};
