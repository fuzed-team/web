import { NextResponse } from "next/server";
import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/matches/celebrity/[id] - Get details for a single celebrity
 */
export async function GET(
	_request: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params;
	const supabase = await createClient();

	const { data: celebrity, error } = await supabase
		.from("celebrities")
		.select("*")
		.eq("id", id)
		.single();

	if (error || !celebrity) {
		return NextResponse.json({ error: "Celebrity not found" }, { status: 404 });
	}

	// Get public URL for celebrity image
	const { data: imageUrl } = supabase.storage
		.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
		.getPublicUrl(celebrity.image_path);

	return NextResponse.json({
		id: celebrity.id,
		name: celebrity.name,
		bio: celebrity.bio,
		category: celebrity.category,
		image_url: imageUrl.publicUrl,
	});
}
