import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import api from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import {
	type CelebritiesInput,
	type CelebrityApi,
	getCelebritiesQueryOptions,
} from "./get-celebrities";

export const setFeaturedCelebritySchema = z.object({
	id: z.string(),
	is_featured: z.boolean(),
	featured_duration_hours: z.number().positive().optional().default(24),
});

export type SetFeaturedCelebrityInput = z.infer<
	typeof setFeaturedCelebritySchema
>;

export const setFeaturedCelebrityApi = (
	input: SetFeaturedCelebrityInput,
): Promise<{ success: boolean; message: string; celebrity: CelebrityApi }> => {
	return api.patch(`/admin/celebrities/${input.id}`, {
		is_featured: input.is_featured,
		featured_duration_hours: input.featured_duration_hours,
	});
};

type UseSetFeaturedCelebrityOptions = {
	inputQuery?: CelebritiesInput;
	mutationConfig?: MutationConfig<typeof setFeaturedCelebrityApi>;
};

export const useSetFeaturedCelebrity = ({
	inputQuery,
	mutationConfig,
}: UseSetFeaturedCelebrityOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (data, ...args) => {
			queryClient.invalidateQueries({
				queryKey: getCelebritiesQueryOptions(inputQuery).queryKey,
			});
			queryClient.invalidateQueries({
				queryKey: ["admin-featured-celebrities"],
			});
			queryClient.invalidateQueries({
				queryKey: ["featured-celebrity"],
			});
			toast.success(data.message);
			onSuccess?.(data, ...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage =
				(error as any)?.message || "Failed to update featured status";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: setFeaturedCelebrityApi,
	});
};
