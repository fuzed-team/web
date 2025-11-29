import { NextResponse } from "next/server";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

/**
 * POST /api/admin/users/[id]/unsuspend
 * Unsuspend a user account
 * Requires admin role
 */
export const POST = withAdminSession(async ({ params, supabase }) => {
	try {
		const userId = params.id;

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 },
			);
		}

		// Check if user exists and is suspended
		const { data: user, error: fetchError } = await supabase
			.from("profiles")
			.select("status")
			.eq("id", userId)
			.single();

		if (fetchError || !user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		if (user.status !== "suspended") {
			return NextResponse.json(
				{ error: "User is not suspended" },
				{ status: 400 },
			);
		}

		// Unsuspend the user
		const { data: updatedUser, error: updateError } = await supabase
			.from("profiles")
			.update({
				status: "active",
				suspended_at: null,
				suspended_by: null,
				suspension_reason: null,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId)
			.select()
			.single();

		if (updateError) {
			console.error("Error unsuspending user:", updateError);
			return NextResponse.json(
				{ error: "Failed to unsuspend user" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "User unsuspended successfully",
			user: {
				id: updatedUser.id,
				status: updatedUser.status,
			},
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
});
