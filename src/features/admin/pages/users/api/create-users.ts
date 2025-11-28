import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import apiClient from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { UserApi } from "@/types/api";
import { createUserSchema } from "./create-user";
import { getUsersQueryOptions, type UsersInput } from "./get-users";

export const createUsersSchema = z.object({
	users: z.array(createUserSchema),
});

export type CreateUsersInput = z.infer<typeof createUsersSchema>;

export const createUsersApi = (input: CreateUsersInput): Promise<UserApi[]> => {
	return apiClient.post("/users/create-many", input);
};

type UseCreateUsersOptions = {
	inputQuery?: UsersInput;
	mutationConfig?: MutationConfig<typeof createUsersApi>;
};

export const useCreateUsers = ({
	inputQuery,
	mutationConfig,
}: UseCreateUsersOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getUsersQueryOptions(inputQuery).queryKey,
			});
			toast.success("Users created successfully");
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage =
				error instanceof AxiosError
					? error.response?.data?.message
					: "Failed to create users";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: createUsersApi,
	});
};
