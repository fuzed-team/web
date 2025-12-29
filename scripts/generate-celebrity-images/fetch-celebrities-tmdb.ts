#!/usr/bin/env tsx

/**
 * Celebrity Auto-Fetcher from TMDB API
 *
 * Automatically fetches celebrity data including:
 * - High quality profile photos
 * - Names and biographies
 * - Gender information
 * - Category classification
 *
 * Usage:
 *   1. Get free API key from https://www.themoviedb.org/settings/api
 *   2. Add to .env: TMDB_API_KEY=your_key_here
 *   3. Run: npx tsx scripts/fetch-celebrities-tmdb.ts
 *
 * Options:
 *   --count=N    Number of celebrities to fetch (default: 200)
 *   --dry-run    Preview without downloading
 */

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Configuration
// const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_KEY = "fe19d70ce8010e7fa142e6c1a981d4c8";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500"; // Good quality, not too large
const OUTPUT_DIR = "./data/celebrities";

// Parse CLI arguments
const args = process.argv.slice(2);
const targetCount = Number.parseInt(
	args.find((a) => a.startsWith("--count="))?.split("=")[1] || "200",
);
const dryRun = args.includes("--dry-run");

// Validate environment
if (!TMDB_API_KEY) {
	console.error("❌ Missing TMDB_API_KEY environment variable");
	console.error("\n📝 How to get a free API key:");
	console.error("   1. Go to https://www.themoviedb.org/signup");
	console.error("   2. Create account and verify email");
	console.error("   3. Go to Settings → API → Create API Key");
	console.error('   4. Add to .env: TMDB_API_KEY="your_key_here"');
	process.exit(1);
}

interface TMDBPerson {
	id: number;
	name: string;
	profile_path: string | null;
	gender: number; // 0=unknown, 1=female, 2=male, 3=non-binary
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
	place_of_birth: string | null;
}

interface CelebrityMetadata {
	filename: string;
	name: string;
	bio: string;
	category: string;
	gender: "male" | "female";
}

/**
 * Map TMDB department to our category
 */
function mapDepartmentToCategory(department: string): string {
	const mapping: Record<string, string> = {
		Acting: "actors",
		Directing: "directors",
		Writing: "writers",
		Production: "producers",
		Sound: "musicians",
		Music: "musicians",
		"Visual Effects": "artists",
		Art: "artists",
		Camera: "filmmakers",
		Editing: "filmmakers",
		"Costume & Make-Up": "artists",
		Crew: "others",
	};
	return mapping[department] || "others";
}

/**
 * Map TMDB gender to our format
 */
function mapGender(gender: number): "male" | "female" {
	// 1 = female, 2 = male, others default to male
	return gender === 1 ? "female" : "male";
}

/**
 * Generate a clean filename from celebrity name
 */
function generateFilename(name: string): string {
	return (
		name
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "") // Remove accents
			.replace(/[^a-z0-9\s-]/g, "") // Remove special chars
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Remove duplicate hyphens
			.trim() + ".jpg"
	);
}

/**
 * Generate a short bio from full biography
 */
function generateShortBio(
	biography: string,
	department: string,
	name: string,
): string {
	if (biography && biography.length > 10) {
		// Take first 1-2 sentences, max 150 chars
		const firstSentence = biography.split(/[.!?]/)[0];
		if (firstSentence.length <= 150) {
			return firstSentence.trim();
		}
		return `${firstSentence.slice(0, 147).trim()}...`;
	}

	// Fallback bio based on department
	const departmentBios: Record<string, string> = {
		Acting: `Actor known for various film and TV appearances`,
		Directing: `Film director and filmmaker`,
		Writing: `Screenwriter and author`,
		Production: `Film and TV producer`,
		Sound: `Music artist and composer`,
		Music: `Musician and recording artist`,
	};

	return departmentBios[department] || `Celebrity and public figure`;
}

/**
 * Fetch popular people from TMDB (paginated)
 */
async function fetchPopularPeople(page: number): Promise<TMDBPerson[]> {
	const response = await fetch(
		`${BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&page=${page}`,
	);

	if (!response.ok) {
		throw new Error(
			`TMDB API error: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	return data.results;
}

/**
 * Fetch detailed person info
 */
async function fetchPersonDetails(id: number): Promise<TMDBPersonDetails> {
	const response = await fetch(
		`${BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}`,
	);

	if (!response.ok) {
		throw new Error(
			`TMDB API error: ${response.status} ${response.statusText}`,
		);
	}

	return response.json();
}

/**
 * Download image from URL to file
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to download image: ${response.status}`);
	}

	const buffer = await response.arrayBuffer();
	await writeFile(filepath, Buffer.from(buffer));
}

/**
 * Load existing metadata if available
 */
async function loadExistingMetadata(): Promise<Map<string, CelebrityMetadata>> {
	const metadataPath = join(OUTPUT_DIR, "metadata.json");
	const map = new Map<string, CelebrityMetadata>();

	if (existsSync(metadataPath)) {
		try {
			const content = await readFile(metadataPath, "utf-8");
			const data = JSON.parse(content);
			for (const celeb of data.celebrities || []) {
				map.set(celeb.name.toLowerCase(), celeb);
			}
			console.log(`📋 Found ${map.size} existing celebrities\n`);
		} catch {
			console.warn("⚠️ Could not read existing metadata.json\n");
		}
	}

	return map;
}

/**
 * Main function
 */
async function main() {
	console.log("═══════════════════════════════════════════════");
	console.log("🎬 TMDB Celebrity Auto-Fetcher");
	console.log("═══════════════════════════════════════════════");
	console.log(`📊 Target: ${targetCount} celebrities`);
	console.log(`📁 Output: ${OUTPUT_DIR}`);
	if (dryRun) console.log("🔍 DRY RUN MODE - No files will be downloaded");
	console.log("");

	// Load existing celebrities to avoid duplicates
	const existingCelebs = await loadExistingMetadata();
	const celebrities: CelebrityMetadata[] = [...existingCelebs.values()];
	const seenNames = new Set(existingCelebs.keys());

	// Create category directories
	const categories = [
		"actors",
		"directors",
		"musicians",
		"writers",
		"producers",
		"artists",
		"filmmakers",
		"others",
	];

	if (!dryRun) {
		for (const category of categories) {
			await mkdir(join(OUTPUT_DIR, category), { recursive: true });
		}
	}

	// Stats
	let fetched = 0;
	let skipped = 0;
	let errors = 0;
	let page = 1;
	const needed = targetCount - celebrities.length;

	if (needed <= 0) {
		console.log(
			`✅ Already have ${celebrities.length} celebrities (target: ${targetCount})`,
		);
		console.log(
			`   Run with --count=${celebrities.length + 50} to fetch more\n`,
		);
	} else {
		console.log(`📥 Need to fetch ${needed} more celebrities\n`);
	}

	// Fetch until we have enough celebrities
	while (fetched < needed && page <= 50) {
		console.log(
			`\n📄 Page ${page} | Fetched: ${fetched}/${needed} | Total: ${celebrities.length}/${targetCount}`,
		);

		try {
			const people = await fetchPopularPeople(page);

			for (const person of people) {
				// Stop if we have enough
				if (fetched >= needed) break;

				// Skip if no profile image
				if (!person.profile_path) {
					console.log(`   ⏭️ ${person.name} - No profile image`);
					skipped++;
					continue;
				}

				// Skip if already exists
				if (seenNames.has(person.name.toLowerCase())) {
					console.log(`   ⏭️ ${person.name} - Already exists`);
					skipped++;
					continue;
				}

				try {
					// Get detailed info for biography
					const details = await fetchPersonDetails(person.id);

					// Generate metadata
					const category = mapDepartmentToCategory(person.known_for_department);
					const filename = generateFilename(person.name);
					const bio = generateShortBio(
						details.biography,
						person.known_for_department,
						person.name,
					);

					const metadata: CelebrityMetadata = {
						filename,
						name: person.name,
						bio,
						category,
						gender: mapGender(person.gender),
					};

					// Download image
					if (!dryRun) {
						const imageUrl = `${IMAGE_BASE}${person.profile_path}`;
						const imagePath = join(OUTPUT_DIR, category, filename);
						await downloadImage(imageUrl, imagePath);
					}

					celebrities.push(metadata);
					seenNames.add(person.name.toLowerCase());
					fetched++;

					console.log(`   ✅ ${person.name} (${category}, ${metadata.gender})`);

					// Rate limiting - TMDB allows 40 requests per 10 seconds
					await new Promise((r) => setTimeout(r, 300));
				} catch (error: any) {
					console.log(`   ❌ ${person.name} - ${error.message}`);
					errors++;
				}
			}

			page++;

			// Small delay between pages
			await new Promise((r) => setTimeout(r, 500));
		} catch (error: any) {
			console.error(`\n❌ Error fetching page ${page}: ${error.message}`);
			break;
		}
	}

	// Save metadata
	if (!dryRun && celebrities.length > 0) {
		const metadataPath = join(OUTPUT_DIR, "metadata.json");
		await writeFile(metadataPath, JSON.stringify({ celebrities }, null, "\t"));
		console.log(`\n💾 Saved metadata to ${metadataPath}`);
	}

	// Summary
	console.log("\n═══════════════════════════════════════════════");
	console.log("📊 SUMMARY");
	console.log("═══════════════════════════════════════════════");
	console.log(`✅ Fetched: ${fetched} new celebrities`);
	console.log(`⏭️ Skipped: ${skipped}`);
	console.log(`❌ Errors: ${errors}`);
	console.log(`📈 Total in database: ${celebrities.length}`);

	// Category breakdown
	const categoryCount: Record<string, number> = {};
	for (const c of celebrities) {
		categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
	}

	console.log("\n📁 By Category:");
	for (const [cat, count] of Object.entries(categoryCount).sort(
		(a, b) => b[1] - a[1],
	)) {
		console.log(`   ${cat}: ${count}`);
	}

	// Gender breakdown
	const maleCount = celebrities.filter((c) => c.gender === "male").length;
	const femaleCount = celebrities.filter((c) => c.gender === "female").length;
	console.log("\n👤 By Gender:");
	console.log(
		`   Male: ${maleCount} (${((maleCount / celebrities.length) * 100).toFixed(1)}%)`,
	);
	console.log(
		`   Female: ${femaleCount} (${((femaleCount / celebrities.length) * 100).toFixed(1)}%)`,
	);

	console.log("\n═══════════════════════════════════════════════");

	if (dryRun) {
		console.log("🔍 This was a DRY RUN. Run without --dry-run to download.");
	} else {
		console.log("✅ Done! Next steps:");
		console.log("   1. Review downloaded images in data/celebrities/");
		console.log("   2. Remove any low-quality photos manually");
		console.log("   3. Run: npx tsx scripts/generate-celebrity-embeddings.ts");
	}
}

// Run
main().catch((error) => {
	console.error("\n❌ Fatal error:", error);
	process.exit(1);
});
