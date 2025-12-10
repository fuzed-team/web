import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import api from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import {
	type CelebritiesInput,
	getCelebritiesQueryOptions,
} from "./get-celebrities";

export const deleteCelebritySchema = z.object({
	id: z.string(),
});

export type DeleteCelebrityInput = z.infer<typeof deleteCelebritySchema>;

export const deleteCelebrityApi = (
	input: DeleteCelebrityInput,
): Promise<{ success: boolean; message: string; id: string }> => {
	return api.delete(`/admin/celebrities/${input.id}`);
};

type UseDeleteCelebrityOptions = {
	inputQuery?: CelebritiesInput;
	mutationConfig?: MutationConfig<typeof deleteCelebrityApi>;
};

export const useDeleteCelebrity = ({
	inputQuery,
	mutationConfig,
}: UseDeleteCelebrityOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getCelebritiesQueryOptions(inputQuery).queryKey,
			});
			queryClient.invalidateQueries({
				queryKey: ["admin-featured-celebrities"],
			});
			toast.success("Celebrity deleted successfully");
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage =
				(error as any)?.message || "Failed to delete celebrity";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: deleteCelebrityApi,
	});
};
