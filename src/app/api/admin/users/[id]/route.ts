import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

/**
 * Schema for user update
 */
const updateUserSchema = z.object({
	email: z.string().email().optional(),
	name: z.string().min(1).optional(),
	gender: z.enum(["male", "female", "other"]).optional(),
	role: z.enum(["admin", "user"]).optional(),
	school: z.string().optional(),
});

/**
 * PATCH /api/admin/users/[id]
 * Update a user
 * Requires admin role
 */
export const PATCH = withAdminSession(async ({ request, params, supabase }) => {
	try {
		const userId = params.id;

		if (!userId) {
			return NextResponse.json(
				{ error: "User ID is required" },
				{ status: 400 },
			);
		}

		const body = await request.json();

		// Validate request body
		const validation = updateUserSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { email, name, role, gender, school } = validation.data;

		// Note: Auth user email update is commented out
		// if (email) {
		// 	const { error: authError } = await supabase.auth.admin.updateUserById(
		// 		userId,
		// 		{ email },
		// 	);
		//
		// 	if (authError) {
		// 		console.error("Error updating auth user:", authError);
		// 		return NextResponse.json(
		// 			{
		// 				error: "Failed to update user email",
		// 				message: authError.message,
		// 			},
		// 			{ status: 400 },
		// 		);
		// 	}
		// }

		// Build profile updates
		const profileUpdates: any = {
			updated_at: new Date().toISOString(),
		};

		if (email !== undefined) profileUpdates.email = email;
		if (name !== undefined) profileUpdates.name = name;
		if (role !== undefined) profileUpdates.role = role;
		if (gender !== undefined) profileUpdates.gender = gender;
		if (school !== undefined) profileUpdates.school = school;

		// Update profile
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.update(profileUpdates)
			.eq("id", userId)
			.select()
			.single();

		if (profileError) {
			console.error("Error updating profile:", profileError);
			return NextResponse.json(
				{ error: "Failed to update user profile" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			id: profile.id,
			name: profile.name,
			email: profile.email,
			role: profile.role,
			gender: profile.gender,
			school: profile.school,
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
});

/**
 * DELETE /api/admin/users/[id]
 * Delete a user
 * Requires admin role
 */
export const DELETE = withAdminSession(
	async ({ params, supabase, session }) => {
		try {
			const userId = params.id;

			if (!userId) {
				return NextResponse.json(
					{ error: "User ID is required" },
					{ status: 400 },
				);
			}

			// Prevent admin from deleting themselves
			if (userId === session.user.id) {
				return NextResponse.json(
					{ error: "Cannot delete your own account" },
					{ status: 400 },
				);
			}

			// Note: Auth user deletion is commented out - only deleting profile
			// const { error: authError } = await supabase.auth.admin.deleteUser(userId);
			//
			// if (authError) {
			// 	console.error("Error deleting user:", authError);
			// 	return NextResponse.json(
			// 		{
			// 			error: "Failed to delete user",
			// 			message: authError.message,
			// 		},
			// 		{ status: 400 },
			// 	);
			// }

			// Delete profile directly
			const { error: profileError } = await supabase
				.from("profiles")
				.delete()
				.eq("id", userId);

			if (profileError) {
				console.error("Error deleting profile:", profileError);
				return NextResponse.json(
					{ error: "Failed to delete user profile" },
					{ status: 500 },
				);
			}

			return NextResponse.json(
				{
					success: true,
					message: "User deleted successfully",
				},
				{ status: 200 },
			);
		} catch (error) {
			console.error("Unexpected error:", error);
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}
	},
);
