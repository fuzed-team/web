import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api-client";

export interface TMDBCelebrity {
	id: number;
	name: string;
	profile_path: string | null;
	gender: number;
	bio: string;
	category: string;
	imageUrl: string;
}

interface FetchTMDBResponse {
	celebrities: TMDBCelebrity[];
}

export const fetchTMDBCelebrities = async (
	count: number,
): Promise<FetchTMDBResponse> => {
	return api.get(`/admin/celebrities/fetch-tmdb?count=${count}`);
};

export const useFetchTMDB = () => {
	return useMutation({
		mutationFn: fetchTMDBCelebrities,
	});
};
