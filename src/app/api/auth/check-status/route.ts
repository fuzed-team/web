import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/check-status - Check if an account is suspended by email
 */
export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ error: "Email parameter is required" },
				{ status: 400 },
			);
		}

		const supabase = await createClient();

		// Check if a profile exists for this email
		const { data: profile, error } = await supabase
			.from("profiles")
			.select("status, suspension_reason, suspended_at")
			.eq("email", email.toLowerCase())
			.single();

		// If no profile exists, account is not suspended (new user)
		if (error || !profile) {
			return NextResponse.json({
				exists: false,
				suspended: false,
			});
		}

		// Check if account is suspended or deleted
		const isSuspended = profile.status === "suspended";
		const isDeleted = profile.status === "deleted";

		return NextResponse.json({
			exists: true,
			suspended: isSuspended,
			deleted: isDeleted,
			status: profile.status,
			suspension_reason: isSuspended ? profile.suspension_reason : null,
			suspended_at: isSuspended ? profile.suspended_at : null,
		});
	} catch (error) {
		console.error("Error checking account status:", error);
		return NextResponse.json(
			{ error: "Failed to check account status" },
			{ status: 500 },
		);
	}
}
