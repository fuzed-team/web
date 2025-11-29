import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminSession } from "@/lib/middleware/with-admin-session";
import { withSession } from "@/lib/middleware/with-session";

/**
 * Schema for creating a flag
 */
const createFlagSchema = z.object({
	reported_user_id: z.string().uuid(),
	reason: z.string().min(10, "Reason must be at least 10 characters"),
});

/**
 * Schema for query parameters
 */
const querySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
	status: z.enum(["pending", "reviewed", "dismissed"]).optional(),
	reported_user_id: z.string().uuid().optional(),
});

/**
 * POST /api/flags
 * Create a new user flag
 * Requires authenticated session
 */
export const POST = withSession(async ({ request, supabase, session }) => {
	try {
		const body = await request.json();

		// Validate request body
		const validation = createFlagSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					details: validation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { reported_user_id, reason } = validation.data;

		// Prevent flagging yourself
		if (reported_user_id === session.user.id) {
			return NextResponse.json(
				{ error: "Cannot flag yourself" },
				{ status: 400 },
			);
		}

		// Check if user already flagged this person
		const { data: existingFlag } = await supabase
			.from("user_flags")
			.select("id")
			.eq("reporter_id", session.user.id)
			.eq("reported_user_id", reported_user_id)
			.single();

		if (existingFlag) {
			return NextResponse.json(
				{ error: "You have already flagged this user" },
				{ status: 400 },
			);
		}

		// Create the flag
		const { data: flag, error: createError } = await supabase
			.from("user_flags")
			.insert({
				reporter_id: session.user.id,
				reported_user_id,
				reason,
				status: "pending",
			})
			.select()
			.single();

		if (createError) {
			console.error("Error creating flag:", createError);
			return NextResponse.json(
				{ error: "Failed to create flag" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				success: true,
				message: "User flagged successfully",
				flag: {
					id: flag.id,
					created_at: flag.created_at,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
});

/**
 * GET /api/flags
 * List all user flags (admin only)
 * Requires admin role
 */
export const GET = withAdminSession(async ({ request, supabase }) => {
	try {
		const { searchParams } = new URL(request.url);
		const params = Object.fromEntries(searchParams);

		// Validate query parameters
		const validation = querySchema.safeParse(params);
		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid query parameters",
					details: validation.error.issues,
				},
				{ status: 400 },
			);
		}

		const { page, limit, status, reported_user_id } = validation.data;

		// Calculate pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		// Build query
		let query = supabase
			.from("user_flags")
			.select(
				`
				id,
				reason,
				status,
				created_at,
				reviewed_at,
				reporter:reporter_id (
					id,
					name,
					email
				),
				reported_user:reported_user_id (
					id,
					name,
					email,
					status
				),
				reviewer:reviewed_by (
					id,
					name
				)
			`,
				{ count: "exact" },
			)
			.range(from, to)
			.order("created_at", { ascending: false });

		// Apply filters
		if (status) {
			query = query.eq("status", status);
		}
		if (reported_user_id) {
			query = query.eq("reported_user_id", reported_user_id);
		}

		const { data: flags, error, count } = await query;

		if (error) {
			console.error("Error fetching flags:", error);
			return NextResponse.json(
				{ error: "Failed to fetch flags" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			data: flags,
			pagination: {
				page,
				limit,
				totalRecords: count || 0,
				totalPages: Math.ceil((count || 0) / limit),
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
