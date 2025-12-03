import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

export type AccountStatusResponse = {
	exists: boolean;
	suspended: boolean;
	deleted?: boolean;
	status?: string;
	suspension_reason?: string | null;
	suspended_at?: string | null;
};

/**
 * Check if an account is suspended or deleted by email
 */
export const checkAccountStatusApi = async (
	email: string,
): Promise<AccountStatusResponse> => {
	return api.get<AccountStatusResponse>(
		`/auth/check-status?email=${encodeURIComponent(email)}`,
	);
};

export const getCheckAccountStatusQueryOptions = (email: string) => {
	return queryOptions({
		queryKey: ["auth", "check-status", email],
		queryFn: () => checkAccountStatusApi(email),
	});
};

type UseCheckAccountStatusOptions = {
	email: string;
	queryConfig?: QueryConfig<typeof getCheckAccountStatusQueryOptions>;
};

export const useCheckAccountStatus = ({
	email,
	queryConfig,
}: UseCheckAccountStatusOptions) => {
	return useQuery({
		...getCheckAccountStatusQueryOptions(email),
		...queryConfig,
	});
};
