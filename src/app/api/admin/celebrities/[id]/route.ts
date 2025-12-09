import { addHours } from "date-fns";
import { NextResponse } from "next/server";
import { z } from "zod";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { withAdminSession } from "@/lib/middleware/with-admin-session";
import { getStartOfTodayUTC } from "@/lib/utils/date";

/**
 * Schema for PATCH request body
 */
const updateCelebritySchema = z.object({
	is_featured: z.boolean().optional(),
	featured_duration_hours: z.number().positive().optional().default(24),
});

/**
 * DELETE /api/admin/celebrities/[id]
 * Delete a celebrity from database and storage
 * Requires admin role
 */
export const DELETE = withAdminSession(async ({ params, supabase }) => {
	try {
		const celebrityId = params.id;

		if (!celebrityId) {
			return NextResponse.json(
				{ error: "Celebrity ID is required" },
				{ status: 400 },
			);
		}

		// Get celebrity to retrieve image path
		const { data: celebrity, error: fetchError } = await supabase
			.from("celebrities")
			.select("id, name, image_path")
			.eq("id", celebrityId)
			.single();

		if (fetchError || !celebrity) {
			return NextResponse.json(
				{ error: "Celebrity not found" },
				{ status: 404 },
			);
		}

		// Delete image from storage
		if (celebrity.image_path) {
			const { error: storageError } = await supabase.storage
				.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
				.remove([celebrity.image_path]);

			if (storageError) {
				console.error("Error deleting celebrity image:", storageError);
				// Continue with database deletion even if storage fails
			}
		}

		// Delete from database
		const { error: deleteError } = await supabase
			.from("celebrities")
			.delete()
			.eq("id", celebrityId);

		if (deleteError) {
			console.error("Error deleting celebrity:", deleteError);
			return NextResponse.json(
				{ error: "Failed to delete celebrity" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Celebrity deleted successfully",
			id: celebrityId,
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
 * PATCH /api/admin/celebrities/[id]
 * Update a celebrity (used for setting featured status)
 * Requires admin role
 */
export const PATCH = withAdminSession(async ({ request, params, supabase }) => {
	try {
		const celebrityId = params.id;

		if (!celebrityId) {
			return NextResponse.json(
				{ error: "Celebrity ID is required" },
				{ status: 400 },
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const validation = updateCelebritySchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid request body",
					details: validation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { is_featured, featured_duration_hours } = validation.data;

		// Get the celebrity to check gender for featured logic
		const { data: celebrity, error: fetchError } = await supabase
			.from("celebrities")
			.select("id, name, gender")
			.eq("id", celebrityId)
			.single();

		if (fetchError || !celebrity) {
			return NextResponse.json(
				{ error: "Celebrity not found" },
				{ status: 404 },
			);
		}

		// If setting as featured, unset previous featured celebrity of same gender
		if (is_featured === true) {
			// Unset current featured celebrity of same gender
			const { error: unsetError } = await supabase
				.from("celebrities")
				.update({
					is_featured: false,
					featured_from: null,
					featured_until: null,
				})
				.eq("gender", celebrity.gender)
				.eq("is_featured", true);

			if (unsetError) {
				console.error("Error unsetting previous featured:", unsetError);
				// Continue anyway
			}

			// Set new featured celebrity with duration
			// featured_from = start of today (00:00:00 UTC)
			// featured_until = start of today + duration hours
			const featuredFrom = getStartOfTodayUTC();
			const featuredUntil = addHours(featuredFrom, featured_duration_hours);

			const { data: updatedCelebrity, error: updateError } = await supabase
				.from("celebrities")
				.update({
					is_featured: true,
					featured_from: featuredFrom.toISOString(),
					featured_until: featuredUntil.toISOString(),
				})
				.eq("id", celebrityId)
				.select()
				.single();

			if (updateError) {
				console.error("Error setting celebrity as featured:", updateError);
				return NextResponse.json(
					{ error: "Failed to set celebrity as featured" },
					{ status: 500 },
				);
			}

			return NextResponse.json({
				success: true,
				message: `${celebrity.name} is now featured for ${featured_duration_hours} hours`,
				celebrity: updatedCelebrity,
			});
		}

		// If just unsetting featured
		if (is_featured === false) {
			const { data: updatedCelebrity, error: updateError } = await supabase
				.from("celebrities")
				.update({
					is_featured: false,
					featured_from: null,
					featured_until: null,
				})
				.eq("id", celebrityId)
				.select()
				.single();

			if (updateError) {
				console.error("Error unsetting celebrity featured:", updateError);
				return NextResponse.json(
					{ error: "Failed to update celebrity" },
					{ status: 500 },
				);
			}

			return NextResponse.json({
				success: true,
				message: `${celebrity.name} is no longer featured`,
				celebrity: updatedCelebrity,
			});
		}

		return NextResponse.json({
			success: true,
			message: "No changes made",
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
});
