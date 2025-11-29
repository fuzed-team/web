import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { UserFlag } from "@/types/api";

export type UpdateFlagInput = {
	id: string;
	status: "reviewed" | "dismissed";
};

export const updateFlagApi = ({
	id,
	status,
}: UpdateFlagInput): Promise<{
	success: boolean;
	message: string;
	flag: Partial<UserFlag>;
}> => {
	return api.patch(`/flags/${id}`, { status });
};

type UseUpdateFlagOptions = {
	mutationConfig?: MutationConfig<typeof updateFlagApi>;
};

export const useUpdateFlag = ({
	mutationConfig,
}: UseUpdateFlagOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		onSuccess: (...args) => {
			queryClient.invalidateQueries({
				queryKey: ["flags"],
			});
			toast.success("Flag updated successfully");
			onSuccess?.(...args);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update flag");
		},
		mutationFn: updateFlagApi,
		...restConfig,
	});
};
