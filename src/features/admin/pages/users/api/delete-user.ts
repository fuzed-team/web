import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import { getUsersQueryOptions, type UsersInput } from "./get-users";

export const deleteUserSchema = z.object({
	id: z.string(),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;

export const deleteUserApi = (input: DeleteUserInput): Promise<void> => {
	return api.delete(`/admin/users/${input.id}`);
};

type UseDeleteUserOptions = {
	inputQuery?: UsersInput;
	mutationConfig?: MutationConfig<typeof deleteUserApi>;
};

export const useDeleteUser = ({
	inputQuery,
	mutationConfig,
}: UseDeleteUserOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getUsersQueryOptions(inputQuery).queryKey,
			});
			toast.success("User deleted successfully");
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage = (error as any)?.message || "Failed to delete user";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: deleteUserApi,
	});
};
