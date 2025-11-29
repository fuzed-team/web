import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getUsersQueryOptions, type UsersInput } from "./get-users";

export const suspendUserSchema = z.object({
	id: z.string(),
	reason: z.string().min(1),
});

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;

export const suspendUserApi = (input: SuspendUserInput): Promise<void> => {
	return api.post(`/admin/users/${input.id}/suspend`, {
		reason: input.reason,
	});
};

type UseSuspendUserOptions = {
	inputQuery?: UsersInput;
	mutationConfig?: MutationConfig<typeof suspendUserApi>;
};

export const useSuspendUser = ({
	inputQuery,
	mutationConfig,
}: UseSuspendUserOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getUsersQueryOptions(inputQuery).queryKey,
			});
			toast.success("User suspended successfully");
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage = (error as any)?.message || "Failed to suspend user";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: suspendUserApi,
	});
};
