import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

const TMDB_API_KEY = env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface TMDBPerson {
	id: number;
	name: string;
	profile_path: string | null;
	gender: number;
	known_for_department: string;
	popularity: number;
}

interface TMDBPersonDetails {
	id: number;
	name: string;
	biography: string;
	profile_path: string | null;
	gender: number;
	birthday: string | null;
	known_for_department: string;
}

function mapDepartmentToCategory(department: string): string {
	const mapping: Record<string, string> = {
		Acting: "actors",
		Directing: "directors",
		Writing: "writers",
		Production: "producers",
		Sound: "musicians",
		Music: "musicians",
	};
	return mapping[department] || "others";
}

function generateShortBio(biography: string, department: string): string {
	if (biography && biography.length > 10) {
		const firstSentence = biography.split(/[.!?]/)[0];
		if (firstSentence.length <= 150) {
			return firstSentence.trim();
		}
		return `${firstSentence.slice(0, 147).trim()}...`;
	}
	const departmentBios: Record<string, string> = {
		Acting: "Actor known for various film and TV appearances",
		Directing: "Film director and filmmaker",
		Music: "Musician and recording artist",
	};
	return departmentBios[department] || "Celebrity and public figure";
}

export const GET = withAdminSession(async ({ searchParams, supabase }) => {
	if (!TMDB_API_KEY) {
		return NextResponse.json(
			{ error: "TMDB_API_KEY not configured" },
			{ status: 500 },
		);
	}

	const count = Math.min(Number(searchParams.count) || 20, 100);

	try {
		// Get count of existing celebrities to calculate start page
		const { count: dbCount, error: countError } = await supabase
			.from("celebrities")
			.select("*", { count: "exact", head: true });

		if (countError) {
			console.error("Error counting celebrities:", countError);
		}

		// Calculate start page based on existing count
		// Each TMDB page has 20 results, so we skip pages we've already fetched
		const existingCount = dbCount || 0;
		const startPage = Math.ceil(existingCount / 20) + 1;

		const celebrities: {
			id: number;
			name: string;
			profile_path: string | null;
			gender: number;
			bio: string;
			category: string;
			imageUrl: string;
		}[] = [];
		const pagesNeeded = Math.ceil(count / 20);

		for (
			let page = startPage;
			page < startPage + pagesNeeded && celebrities.length < count;
			page++
		) {
			const response = await fetch(
				`${BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&page=${page}`,
			);

			if (!response.ok) {
				throw new Error(`TMDB API error: ${response.status}`);
			}

			const data = await response.json();

			for (const person of data.results as TMDBPerson[]) {
				if (celebrities.length >= count) break;
				if (!person.profile_path) continue;

				// Get detailed info
				const detailResponse = await fetch(
					`${BASE_URL}/person/${person.id}?api_key=${TMDB_API_KEY}`,
				);
				const details: TMDBPersonDetails = await detailResponse.json();

				celebrities.push({
					id: person.id,
					name: person.name,
					profile_path: person.profile_path,
					gender: person.gender,
					bio: generateShortBio(details.biography, person.known_for_department),
					category: mapDepartmentToCategory(person.known_for_department),
					imageUrl: `${IMAGE_BASE}${person.profile_path}`,
				});

				// Small delay to avoid rate limit
				await new Promise((r) => setTimeout(r, 100));
			}
		}

		return NextResponse.json({ celebrities });
	} catch (error: unknown) {
		console.error("TMDB fetch error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch celebrities";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
});
