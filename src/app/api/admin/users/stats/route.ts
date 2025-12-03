import { NextResponse } from "next/server";
import { withAdminSession } from "@/lib/middleware/with-admin-session";
import type { UserRole, UserStatus } from "@/types/api";

export const GET = withAdminSession(async ({ supabase }) => {
	try {
		// Fetch only role and status for all users to aggregate counts
		// Using a single query is more efficient than multiple count queries for small to medium datasets
		const { data, error } = await supabase
			.from("profiles")
			.select("role, status");

		if (error) {
			console.error("Error fetching user stats:", error);
			return NextResponse.json(
				{ error: "Failed to fetch user statistics" },
				{ status: 500 },
			);
		}

		// Initialize counts
		const roleCounts: Record<string, number> = {
			admin: 0,
			user: 0,
		};

		const statusCounts: Record<string, number> = {
			active: 0,
			suspended: 0,
			deleted: 0,
		};

		// Aggregate counts
		data?.forEach((user) => {
			// Count roles
			const role = user.role as UserRole;
			if (role && roleCounts[role] !== undefined) {
				roleCounts[role]++;
			}

			// Count statuses
			// Default to 'active' if status is missing/null, or handle as needed
			const status = (user.status as UserStatus) || "active";
			if (status && statusCounts[status] !== undefined) {
				statusCounts[status]++;
			}
		});

		return NextResponse.json({
			role: roleCounts,
			status: statusCounts,
		});
	} catch (error) {
		console.error("Unexpected error in stats endpoint:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
});
