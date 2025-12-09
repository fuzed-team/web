import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

/**
 * Schema for query parameters
 */
const querySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
	name: z.string().optional(),
	category: z.string().optional(),
	gender: z.string().optional(),
	is_featured: z.string().optional(),
	sort: z.string().optional(),
});

/**
 * GET /api/admin/celebrities
 * List all celebrities with pagination and filtering
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

		const { page, limit, name, category, gender, sort, is_featured } =
			validation.data;

		// Calculate pagination
		const from = (page - 1) * limit;
		const to = from + limit - 1;

		// Determine sort
		let sortColumn = "created_at";
		let ascending = false;

		if (sort) {
			const [field, direction] = sort.split(".");
			if (direction === "asc") {
				ascending = true;
			}

			// Map frontend fields to DB columns
			const fieldMap: Record<string, string> = {
				created_at: "created_at",
				name: "name",
				category: "category",
				gender: "gender",
				quality_score: "quality_score",
			};

			if (field && fieldMap[field]) {
				sortColumn = fieldMap[field];
			}
		}

		// Build query
		let query = supabase.from("celebrities").select("*", { count: "exact" });

		// Apply filters
		if (name) {
			query = query.ilike("name", `%${name}%`);
		}
		if (category) {
			const categories = category.split(",");
			if (categories.length > 1) {
				query = query.in("category", categories);
			} else {
				query = query.eq("category", category);
			}
		}
		if (gender) {
			const genders = gender.split(",");
			if (genders.length > 1) {
				query = query.in("gender", genders);
			} else {
				query = query.eq("gender", gender);
			}
		}
		if (is_featured) {
			query = query.eq("is_featured", is_featured === "true");
		}

		// Apply sort and pagination
		query = query
			.order(sortColumn, { ascending })
			.order("id", { ascending: true })
			.range(from, to);

		const { data: celebrities, error, count } = await query;

		if (error) {
			console.error("Error fetching celebrities:", error);
			return NextResponse.json(
				{ error: "Failed to fetch celebrities" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			data: celebrities || [],
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
