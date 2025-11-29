import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

/**
 * Schema for updating a flag
 */
const updateFlagSchema = z.object({
	status: z.enum(["reviewed", "dismissed"]),
});

/**
 * PATCH /api/flags/[id]
 * Update a flag status (admin only)
 * Requires admin role
 */
export const PATCH = withAdminSession(
	async ({ request, params, supabase, session }) => {
		try {
			const flagId = params.id;

			if (!flagId) {
				return NextResponse.json(
					{ error: "Flag ID is required" },
					{ status: 400 },
				);
			}

			const body = await request.json();

			// Validate request body
			const validation = updateFlagSchema.safeParse(body);
			if (!validation.success) {
				return NextResponse.json(
					{
						error: "Validation failed",
						details: validation.error.issues,
					},
					{ status: 400 },
				);
			}

			const { status } = validation.data;

			// Check if flag exists
			const { data: flag, error: fetchError } = await supabase
				.from("user_flags")
				.select("id, status")
				.eq("id", flagId)
				.single();

			if (fetchError || !flag) {
				return NextResponse.json({ error: "Flag not found" }, { status: 404 });
			}

			if (flag.status !== "pending") {
				return NextResponse.json(
					{ error: "Flag has already been reviewed" },
					{ status: 400 },
				);
			}

			// Update the flag
			const { data: updatedFlag, error: updateError } = await supabase
				.from("user_flags")
				.update({
					status,
					reviewed_by: session.user.id,
					reviewed_at: new Date().toISOString(),
				})
				.eq("id", flagId)
				.select()
				.single();

			if (updateError) {
				console.error("Error updating flag:", updateError);
				return NextResponse.json(
					{ error: "Failed to update flag" },
					{ status: 500 },
				);
			}

			return NextResponse.json({
				success: true,
				message: "Flag updated successfully",
				flag: {
					id: updatedFlag.id,
					status: updatedFlag.status,
					reviewed_at: updatedFlag.reviewed_at,
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
