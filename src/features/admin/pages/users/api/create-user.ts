import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { UserApi } from "@/types/api";
import { USER_ROLES } from "../constants/user-constants";
import { getUsersQueryOptions, type UsersInput } from "./get-users";

export const createUserSchema = z.object({
	email: z.string().email(),
	name: z.string().max(15),
	role: z.enum(USER_ROLES),
	school: z.string().optional(),
	gender: z.string().optional(),
	age: z.number().optional(),
	image: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const createUserApi = (input: CreateUserInput): Promise<UserApi> => {
	return api.post("/admin/users", input);
};

type UseCreateUserOptions = {
	inputQuery?: UsersInput;
	mutationConfig?: MutationConfig<typeof createUserApi>;
};

export const useCreateUser = ({
	inputQuery,
	mutationConfig,
}: UseCreateUserOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: getUsersQueryOptions(inputQuery).queryKey,
			});
			toast.success("User created successfully");
			onSuccess?.(...args);
		},
		onError: (error: Error, ...args) => {
			const errorMessage = (error as any)?.message || "Failed to create user";
			toast.error(errorMessage);
			onError?.(error, ...args);
		},
		...restConfig,
		mutationFn: createUserApi,
	});
};
