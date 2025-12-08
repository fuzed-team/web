import { STORAGE_BUCKETS } from "@/lib/constants/constant";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Get remaining time until celebrity feature expires
 */
export function getTimeLeft(featuredUntil: string | null): string {
	if (!featuredUntil) return "No expiry";
	const now = Date.now();
	const end = new Date(featuredUntil).getTime();
	const diff = end - now;
	if (diff <= 0) return "Expired";
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	return `${hours}h ${minutes}m left`;
}

/**
 * Get public URL for celebrity image from Supabase storage
 */
export function getCelebrityImageUrl(imagePath: string): string {
	const { data } = supabase.storage
		.from(STORAGE_BUCKETS.CELEBRITY_IMAGES)
		.getPublicUrl(imagePath);
	return data.publicUrl;
}
