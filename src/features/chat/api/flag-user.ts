import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";

export const flagUserSchema = z.object({
	reported_user_id: z.string(),
	reason: z.string().min(10),
});

export type FlagUserInput = z.infer<typeof flagUserSchema>;

export const flagUserApi = (input: FlagUserInput): Promise<void> => {
	return api.post("/flags", input);
};

type UseFlagUserOptions = {
	mutationConfig?: MutationConfig<typeof flagUserApi>;
};

export const useFlagUser = ({ mutationConfig }: UseFlagUserOptions = {}) => {
	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			toast.success(
				"User flagged successfully. Our team will review this report.",
			);
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage = (error as any)?.message || "Failed to flag user";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: flagUserApi,
	});
};
