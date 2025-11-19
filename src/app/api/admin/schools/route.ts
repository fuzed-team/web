import { NextResponse } from "next/server";
import { withSession } from "@/lib/middleware/with-session";

export interface SchoolStatistics {
	school: string;
	total_users: number;
	active_users_7d: number;
	total_matches: number;
	avg_matches_per_user: number;
}

/**
 * GET /api/admin/schools - Get all schools with statistics
 *
 * Admin-only endpoint that returns school analytics:
 * - Total users per school
 * - Active users (last 7 days)
 * - Total matches generated
 * - Average matches per user
 *
 * Requires:
 * - Authenticated user with role = 'admin'
 */
export const GET = withSession(
	async ({ supabase, session }): Promise<NextResponse> => {
		// Verify admin role
		if (session.profile.role !== "admin") {
			return NextResponse.json(
				{ error: "Unauthorized: Admin access required" },
				{ status: 403 },
			);
		}

		// Get school statistics from database function
		const { data: schools, error: schoolsError } = await supabase.rpc(
			"get_school_statistics",
		);

		if (schoolsError) {
			console.error("Error fetching school statistics:", schoolsError);
			return NextResponse.json(
				{ error: "Failed to fetch school statistics" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			schools: schools || [],
			total_schools: schools?.length || 0,
		});
	},
);
