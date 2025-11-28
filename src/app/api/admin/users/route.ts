import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { withAdminSession } from "@/lib/middleware/with-admin-session";

/**
 * Schema for user creation
 */
const createUserSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	role: z.enum(["admin", "user"]).default("user"),
	gender: z.enum(["male", "female", "other"]).optional(),
	school: z.string().optional(),
});

/**
 * Schema for query parameters
 */
const querySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
	name: z.string().optional(),
	role: z.string().optional(),
	createdAtFrom: z.string().optional(),
	createdAtTo: z.string().optional(),
	sort: z.string().optional(),
});

/**
 * GET /api/admin/users
 * List all users with pagination and filtering
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

		const { page, limit, name, role, createdAtFrom, createdAtTo, sort } =
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
				createdAt: "created_at",
				updatedAt: "updated_at",
				name: "name",
				email: "email",
				role: "role",
				gender: "gender",
				school: "school",
				age: "age",
			};

			if (field && fieldMap[field]) {
				sortColumn = fieldMap[field];
			}
		}

		// Build query
		let query = supabase
			.from("profiles")
			.select("*", { count: "exact" })
			.range(from, to)
			.order(sortColumn, { ascending });

		// Apply filters
		if (name) {
			query = query.ilike("name", `%${name}%`);
		}
		if (role) {
			query = query.eq("role", role);
		}
		if (createdAtFrom) {
			query = query.gte("created_at", createdAtFrom);
		}
		if (createdAtTo) {
			query = query.lte("created_at", createdAtTo);
		}

		const { data: users, error, count } = await query;

		if (error) {
			console.error("Error fetching users:", error);
			return NextResponse.json(
				{ error: "Failed to fetch users" },
				{ status: 500 },
			);
		}

		// Get signed URLs for images if they have default_face_id
		const usersWithImages = await Promise.all(
			(users || []).map(async (user) => {
				let image = null;
				if (user.default_face_id) {
					const { data: face } = await supabase
						.from("faces")
						.select("image_path")
						.eq("id", user.default_face_id)
						.single();

					if (face?.image_path) {
						const { data: signedUrl } = await supabase.storage
							.from(STORAGE_BUCKETS.USER_IMAGES)
							.createSignedUrl(face.image_path, env.SUPABASE_SIGNED_URL_TTL);

						image = signedUrl?.signedUrl || null;
					}
				}

				return {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role || "user",
					gender: user.gender,
					school: user.school,
					default_face_id: user.default_face_id,
					image,
					age: user.age,
					createdAt: user.created_at,
					updatedAt: user.updated_at,
				};
			}),
		);

		return NextResponse.json({
			data: usersWithImages,
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

/**
 * POST /api/admin/users
 * Create a new user
 * Requires admin role
 */
export const POST = withAdminSession(async ({ request, supabase }) => {
	try {
		const body = await request.json();

		// Validate request body
		const validation = createUserSchema.safeParse(body);
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

		// Note: Auth user creation is commented out - only creating profile
		// const { data: authUser, error: authError } =
		// 	await supabase.auth.admin.createUser({
		// 		email,
		// 		password,
		// 		email_confirm: true,
		// 	});
		//
		// if (authError) {
		// 	console.error("Error creating auth user:", authError);
		// 	return NextResponse.json(
		// 		{
		// 			error: "Failed to create user",
		// 			message: authError.message,
		// 		},
		// 		{ status: 400 },
		// 	);
		// }

		// Create profile directly
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.insert({
				email,
				name,
				role,
				gender,
				school,
			})
			.select()
			.single();

		if (profileError) {
			console.error("Error creating profile:", profileError);
			return NextResponse.json(
				{ error: "Failed to create user profile" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				id: profile.id,
				name: profile.name,
				email: profile.email,
				role: profile.role,
				gender: profile.gender,
				school: profile.school,
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
