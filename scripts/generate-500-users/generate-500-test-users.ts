import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { env } from "@/config/env";
import { FEMALE_NAMES, MALE_NAMES, shuffle } from "./data/prompt-data";

/**
 * Generate 500 Synthetic Test Users
 *
 * Requirements:
 * - 500 total users (250 male, 250 female)
 * - All assigned to same school
 * - Census-based names (2004 birth year for 20-year-olds)
 * - Non-.edu emails (dev environment)
 */

const TOTAL_USERS = 100;
const SCHOOL = "Columbia University"; // All users same school
const TEST_RUN_ID = `test-500-${Date.now()}`;

interface TestUser {
	id: string;
	email: string;
	name: string;
	gender: "male" | "female";
	school: string;
	role: string;
}

async function generateTestUsers() {
	const supabase = createClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.SUPABASE_SERVICE_ROLE_KEY,
	);

	console.log("🚀 Starting 500-user generation...");
	console.log(`Test Run ID: ${TEST_RUN_ID}\n`);

	// Pre-shuffle name pools (each name used exactly once)
	const maleNames = shuffle(MALE_NAMES);
	const femaleNames = shuffle(FEMALE_NAMES);

	const users: TestUser[] = [];

	// Generate 250 male + 250 female users
	for (let i = 0; i < TOTAL_USERS; i++) {
		const gender: "male" | "female" = i < TOTAL_USERS / 2 ? "male" : "female";
		const name = gender === "male" ? maleNames.pop()! : femaleNames.pop()!;

		const user: TestUser = {
			id: randomUUID(), // Generate UUID for profile ID
			email: `${name.toLowerCase().replace(/\s+/g, ".")}.${randomUUID().slice(0, 8)}@test.com`,
			name,
			gender: gender,
			school: SCHOOL,
			role: "user",
		};

		users.push(user);

		if ((i + 1) % 50 === 0) {
			console.log(`📝 Generated ${i + 1}/${TOTAL_USERS} users...`);
		}
	}

	console.log(`\n✅ Generated ${users.length} test users`);
	console.log(`   - Male: ${users.filter((u) => u.gender === "male").length}`);
	console.log(
		`   - Female: ${users.filter((u) => u.gender === "female").length}`,
	);
	console.log(`   - School: ${SCHOOL}\n`);

	// Batch insert in chunks of 100
	const BATCH_SIZE = 100;
	let insertedCount = 0;

	for (let i = 0; i < users.length; i += BATCH_SIZE) {
		const batch = users.slice(i, i + BATCH_SIZE);

		const { error } = await supabase
			.from("profiles")
			.insert(batch)
			.select("id");

		if (error) {
			console.error(`❌ Error inserting batch ${i / BATCH_SIZE + 1}:`, error);
			throw error;
		}

		insertedCount += batch.length;
		console.log(
			`💾 Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(users.length / BATCH_SIZE)} (${insertedCount}/${users.length} total)`,
		);
	}

	console.log(`\n🎉 Successfully created ${insertedCount} test users!`);
	console.log(`\nNext steps:`);
	console.log(
		`1. Run: bun run scripts/generate-500-users/analyze-faces-replicate.ts`,
	);
	console.log(
		`2. Run: bun run scripts/generate-500-users/trigger-match-generation.ts`,
	);
	console.log(
		`3. Monitor: bun run scripts/generate-500-users/monitor-load-test.ts\n`,
	);

	return insertedCount;
}

// Run the script
generateTestUsers()
	.then((count) => {
		console.log(`✅ Script completed. ${count} users created.`);
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Script failed:", error);
		process.exit(1);
	});
