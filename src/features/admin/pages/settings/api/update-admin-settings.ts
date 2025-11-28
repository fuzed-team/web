import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { SystemSettings } from "./get-admin-settings";

export type UpdateSettingsInput = Partial<SystemSettings>;

export const updateAdminSettingsApi = (
	updates: UpdateSettingsInput,
): Promise<SystemSettings> => {
	return api.patch("/admin/settings", updates);
};

type UseUpdateAdminSettingsOptions = {
	mutationConfig?: MutationConfig<typeof updateAdminSettingsApi>;
};

export const useUpdateAdminSettings = ({
	mutationConfig,
}: UseUpdateAdminSettingsOptions = {}) => {
	const queryClient = useQueryClient();

	const { onSuccess, ...restConfig } = mutationConfig || {};

	return useMutation({
		mutationFn: updateAdminSettingsApi,
		onSuccess: (...args) => {
			queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
			onSuccess?.(...args);
		},
		...restConfig,
	});
};
