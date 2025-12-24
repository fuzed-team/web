import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserQuotaQueryOptions } from "@/features/quotas/api/get-user-quota";
import api from "@/lib/api-client";
import type { MutationConfig, QueryConfig } from "@/lib/react-query";

interface CelebrityBabyApi {
	id: string;
	celebrity_match_id: string;
	image_url: string;
	created_at: string;
	celebrity: {
		id: string;
		name: string;
	};
	user: {
		id: string;
		name: string;
	};
}

interface GetCelebrityBabyApi {
	baby: {
		id: string;
		celebrity_match_id: string;
		image_url: string;
		created_at: string;
	} | null;
}

export const generateCelebrityBabyApi = (
	celebrityMatchId: string,
): Promise<CelebrityBabyApi> => {
	return api.post<CelebrityBabyApi>("/baby/celebrity", {
		celebrity_match_id: celebrityMatchId,
	});
};

type UseGenerateCelebrityBabyOptions = {
	mutationConfig?: MutationConfig<typeof generateCelebrityBabyApi>;
};

export const useGenerateCelebrityBaby = ({
	mutationConfig,
}: UseGenerateCelebrityBabyOptions = {}) => {
	const queryClient = useQueryClient();
	const { onSuccess, onError, ...restConfig } = mutationConfig || {};

	return useMutation({
		mutationFn: generateCelebrityBabyApi,
		onSuccess: (data, celebrityMatchId, ...args) => {
			queryClient.setQueryData(["baby", "celebrity", celebrityMatchId], {
				baby: data,
			});
			queryClient.invalidateQueries({ queryKey: ["baby", "list"] });
			queryClient.invalidateQueries({
				queryKey: getUserQuotaQueryOptions().queryKey,
			});
			onSuccess?.(data, celebrityMatchId, ...args);
		},
		onError: (error: any, ...args) => {
			// Handle rate limit errors (429) with specific messaging
			if (error.status === 429 && error.data) {
				const { limit, current, resetAt } = error.data;
				const resetDate = new Date(resetAt);
				const resetTimeStr = resetDate.toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
				});

				toast.error(
					`Daily limit reached (${current}/${limit}). Resets at ${resetTimeStr} UTC.`,
					{ duration: 5000 },
				);
			} else {
				// Handle other errors
				const errorMessage = error.message || "Failed to generate baby image";
				toast.error(errorMessage);
			}

			onError?.(error, ...args);
		},
		...restConfig,
	});
};

// Query hook to get existing baby for a celebrity match
export const getCelebrityBabyApi = (
	celebrityMatchId: string,
): Promise<GetCelebrityBabyApi> => {
	return api.get<GetCelebrityBabyApi>(
		`/baby/celebrity?celebrity_match_id=${celebrityMatchId}`,
	);
};

type UseCelebrityBabyOptions = {
	celebrityMatchId?: string;
	queryConfig?: QueryConfig<typeof getCelebrityBabyApi>;
};

export const useCelebrityBaby = ({
	celebrityMatchId,
	queryConfig,
}: UseCelebrityBabyOptions) => {
	return useQuery({
		queryKey: ["baby", "celebrity", celebrityMatchId],
		queryFn: () => getCelebrityBabyApi(celebrityMatchId!),
		enabled: !!celebrityMatchId,
		...queryConfig,
	});
};
