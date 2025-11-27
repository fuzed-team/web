import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

/**
 * Generate 500 Synthetic Test Users
 *
 * Requirements:
 * - 500 total users (250 male, 250 female)
 * - All assigned to same school
 * - Diverse, realistic names
 * - Non-.edu emails (dev environment)
 */

const TOTAL_USERS = 500;
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
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);

	console.log("🚀 Starting 500-user generation...");
	console.log(`Test Run ID: ${TEST_RUN_ID}\n`);

	const users: TestUser[] = [];

	// Generate 250 male + 250 female users
	for (let i = 0; i < TOTAL_USERS; i++) {
		const gender: "male" | "female" = i < 250 ? "male" : "female";

		const user: TestUser = {
			id: randomUUID(), // Generate UUID for profile ID
			email: faker.internet.email(),
			name: faker.person.fullName({ sex: gender }),
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
	console.log(`1. Run: bun run scripts/analyze-faces-replicate.ts`);
	console.log(`2. Run: bun run scripts/trigger-match-generation.ts`);
	console.log(`3. Monitor: bun run scripts/monitor-load-test.ts\n`);

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
