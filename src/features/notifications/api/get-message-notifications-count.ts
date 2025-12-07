import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export interface MessageNotificationsCountResponse {
	unread_count: number;
}

export const getMessageNotificationsCountApi = async (
	signal?: AbortSignal,
): Promise<MessageNotificationsCountResponse> => {
	return api.get<MessageNotificationsCountResponse>(
		"/notifications/messages/count",
		{ signal },
	);
};

export const getMessageNotificationsCountQueryOptions = () => {
	return queryOptions({
		queryKey: ["notifications", "messages", "count"],
		queryFn: ({ signal }) => getMessageNotificationsCountApi(signal),
		staleTime: 1000 * 30, // 30 seconds
	});
};

type UseMessageNotificationsCountOptions = {
	queryConfig?: QueryConfig<typeof getMessageNotificationsCountQueryOptions>;
};

export const useMessageNotificationsCount = ({
	queryConfig,
}: UseMessageNotificationsCountOptions = {}) => {
	return useQuery({
		...getMessageNotificationsCountQueryOptions(),
		...queryConfig,
	});
};
