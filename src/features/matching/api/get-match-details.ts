import { queryOptions, useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";
import type { Commonality } from "../utils/generate-match-message";

export interface MatchDetails {
	match: {
		id: string;
		similarity_score: number;
		created_at: string;
		face_a_id: string;
		face_b_id: string;
	};
	commonalities: Commonality[];
}

/**
 * Fetches match details including commonalities
 * @param matchId - The match ID to fetch details for
 */
export const getMatchDetailsApi = async (
	matchId: string,
): Promise<MatchDetails> => {
	return api.get<MatchDetails>(`/matches/${matchId}`);
};

export const getMatchDetailsQueryOptions = (matchId: string) => {
	return queryOptions({
		queryKey: ["matches", matchId, "details"],
		queryFn: () => getMatchDetailsApi(matchId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!matchId,
	});
};

type UseMatchDetailsOptions = {
	matchId?: string;
	queryConfig?: QueryConfig<typeof getMatchDetailsQueryOptions>;
};

export const useMatchDetails = ({
	matchId,
	queryConfig,
}: UseMatchDetailsOptions) => {
	return useQuery({
		...getMatchDetailsQueryOptions(matchId || ""),
		...queryConfig,
		enabled: !!matchId && (queryConfig?.enabled ?? true),
	});
};
