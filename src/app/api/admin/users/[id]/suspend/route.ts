import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

/**
 * Schema for suspension request
 */
const suspendUserSchema = z.object({
	reason: z.string().min(1, "Suspension reason is required"),
});

/**
 * POST /api/admin/users/[id]/suspend
 * Suspend a user account
 * Requires admin role
 */
export const POST = withAdminSession(
	async ({ request, params, supabase, session }) => {
		try {
			const userId = params.id;

			if (!userId) {
				return NextResponse.json(
					{ error: "User ID is required" },
					{ status: 400 },
				);
			}

			// Prevent admin from suspending themselves
			if (userId === session.user.id) {
				return NextResponse.json(
					{ error: "Cannot suspend your own account" },
					{ status: 400 },
				);
			}

			const body = await request.json();

			// Validate request body
			const validation = suspendUserSchema.safeParse(body);
			if (!validation.success) {
				return NextResponse.json(
					{
						error: "Validation failed",
						details: validation.error.issues,
					},
					{ status: 400 },
				);
			}

			const { reason } = validation.data;

			// Check if user exists and is not already suspended
			const { data: user, error: fetchError } = await supabase
				.from("profiles")
				.select("status")
				.eq("id", userId)
				.single();

			if (fetchError || !user) {
				return NextResponse.json({ error: "User not found" }, { status: 404 });
			}

			if (user.status === "suspended") {
				return NextResponse.json(
					{ error: "User is already suspended" },
					{ status: 400 },
				);
			}

			// Suspend the user
			const { data: updatedUser, error: updateError } = await supabase
				.from("profiles")
				.update({
					status: "suspended",
					suspended_at: new Date().toISOString(),
					suspended_by: session.user.id,
					suspension_reason: reason,
					updated_at: new Date().toISOString(),
				})
				.eq("id", userId)
				.select()
				.single();

			if (updateError) {
				console.error("Error suspending user:", updateError);
				return NextResponse.json(
					{ error: "Failed to suspend user" },
					{ status: 500 },
				);
			}

			return NextResponse.json({
				success: true,
				message: "User suspended successfully",
				user: {
					id: updatedUser.id,
					status: updatedUser.status,
					suspended_at: updatedUser.suspended_at,
				},
			});
		} catch (error) {
			console.error("Unexpected error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	},
);
