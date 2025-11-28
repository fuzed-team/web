import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { UserApi } from "@/types/api";
import { getUsersQueryOptions, type UsersInput } from "./get-users";

export const updateUserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	name: z.string().max(15).optional(),
	gender: z.string().optional(),
	role: z.string().optional(),
	school: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserApi = (input: UpdateUserInput): Promise<UserApi> => {
	const { id, ...rest } = input;
	return api.patch(`/admin/users/${id}`, rest);
};

type UseUpdateUserOptions = {
	inputQuery?: UsersInput;
	mutationConfig?: MutationConfig<typeof updateUserApi>;
};

export const useUpdateUser = ({
	inputQuery,
	mutationConfig,
}: UseUpdateUserOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getUsersQueryOptions(inputQuery).queryKey,
			});
			onSuccess?.(...args);
			toast.success("User updated successfully");
		},
		onError: (error: Error, ...args) => {
			const errorMessage = (error as any)?.message || "Failed to update user";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: updateUserApi,
	});
};
