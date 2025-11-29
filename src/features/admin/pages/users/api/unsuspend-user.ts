import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getUsersQueryOptions, type UsersInput } from "./get-users";

export const unsuspendUserSchema = z.object({
	id: z.string(),
});

export type UnsuspendUserInput = z.infer<typeof unsuspendUserSchema>;

export const unsuspendUserApi = (input: UnsuspendUserInput): Promise<void> => {
	return api.post(`/admin/users/${input.id}/unsuspend`);
};

type UseUnsuspendUserOptions = {
	inputQuery?: UsersInput;
	mutationConfig?: MutationConfig<typeof unsuspendUserApi>;
};

export const useUnsuspendUser = ({
	inputQuery,
	mutationConfig,
}: UseUnsuspendUserOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getUsersQueryOptions(inputQuery).queryKey,
			});
			toast.success("User unsuspended successfully");
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage =
				(error as any)?.message || "Failed to unsuspend user";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: unsuspendUserApi,
	});
};
