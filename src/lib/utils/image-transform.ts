/**
 * Supabase Image Transformation Utilities
 *
 * Supabase Storage supports automatic image transformation via URL parameters.
 * This allows you to resize, compress, and convert images on-the-fly without
 * re-uploading or storing multiple versions.
 *
 * @see https://supabase.com/docs/guides/storage/serving/image-transformations
 */

/**
 * Image transformation options for Supabase Storage
 */
export interface ImageTransformOptions {
	/** Width in pixels (max 5000) */
	width?: number;
	/** Height in pixels (max 5000) */
	height?: number;
	/** Quality (1-100, default: 80) */
	quality?: number;
	/** Output format */
	format?: "webp" | "jpeg" | "png" | "avif";
	/** Resize mode */
	resize?: "cover" | "contain" | "fill";
}

/**
 * Predefined image size presets for common use cases
 */
export const IMAGE_PRESETS = {
	/** Thumbnail size (200x200) - for avatars, small previews */
	thumbnail: { width: 200, height: 200, quality: 70, format: "webp" as const },

	/** Card size (600x750) - for match cards, profile cards */
	card: { width: 600, height: 750, quality: 75, format: "webp" as const },

	/** Medium size (800x1000) - for detail views */
	medium: { width: 800, height: 1000, quality: 80, format: "webp" as const },

	/** Full size (1200x1500) - for full-screen views */
	full: { width: 1200, height: 1500, quality: 85, format: "webp" as const },
} as const;

/**
 * Apply Supabase image transformation parameters to a URL
 *
 * Supabase automatically transforms images when you add query parameters to the URL.
 * This works with both public URLs and signed URLs.
 *
 * @param imageUrl - The base Supabase Storage URL (public or signed)
 * @param options - Transformation options
 * @returns Transformed image URL
 *
 * @example
 * ```ts
 * // Basic usage
 * const optimized = applyImageTransform(
 *   'https://abc.supabase.co/storage/v1/object/public/images/photo.jpg',
 *   { width: 600, quality: 75, format: 'webp' }
 * );
 * // Returns: https://abc.supabase.co/storage/v1/render/image/public/images/photo.jpg?width=600&quality=75&format=webp
 *
 * // Using presets
 * const thumbnail = applyImageTransform(url, IMAGE_PRESETS.thumbnail);
 *
 * // Works with signed URLs too
 * const signedUrl = 'https://abc.supabase.co/storage/v1/object/sign/private/photo.jpg?token=...';
 * const optimizedSigned = applyImageTransform(signedUrl, { width: 400 });
 * ```
 */
export function applyImageTransform(
	imageUrl: string | null | undefined,
	options: ImageTransformOptions,
): string | null {
	if (!imageUrl) return null;

	try {
		const url = new URL(imageUrl);

		// Check if this is a Supabase Storage URL
		const isSupabaseStorage =
			url.pathname.includes("/storage/v1/object/") ||
			url.pathname.includes("/storage/v1/render/");

		if (!isSupabaseStorage) {
			// Not a Supabase URL, return as-is
			return imageUrl;
		}

		// For transformation to work, we need to change the path from /object/ to /render/image/
		// Keep existing path structure: /public/ or /sign/
		let transformedPath = url.pathname;

		if (url.pathname.includes("/storage/v1/object/public/")) {
			transformedPath = url.pathname.replace(
				"/storage/v1/object/public/",
				"/storage/v1/render/image/public/",
			);
		} else if (url.pathname.includes("/storage/v1/object/sign/")) {
			transformedPath = url.pathname.replace(
				"/storage/v1/object/sign/",
				"/storage/v1/render/image/sign/",
			);
		}

		// Build new URL with transformation path
		const transformedUrl = new URL(transformedPath, url.origin);

		// Copy existing query parameters (important for signed URLs with tokens)
		url.searchParams.forEach((value, key) => {
			transformedUrl.searchParams.set(key, value);
		});

		// Add transformation parameters
		if (options.width) {
			transformedUrl.searchParams.set("width", options.width.toString());
		}
		if (options.height) {
			transformedUrl.searchParams.set("height", options.height.toString());
		}
		if (options.quality) {
			transformedUrl.searchParams.set("quality", options.quality.toString());
		}
		if (options.format) {
			transformedUrl.searchParams.set("format", options.format);
		}
		if (options.resize) {
			transformedUrl.searchParams.set("resize", options.resize);
		}

		return transformedUrl.toString();
	} catch (error) {
		// If URL parsing fails, return original URL
		console.error("Failed to apply image transformation:", error);
		return imageUrl;
	}
}

/**
 * Helper to get an optimized thumbnail URL
 */
export function getThumbnailUrl(
	imageUrl: string | null | undefined,
): string | null {
	return applyImageTransform(imageUrl, IMAGE_PRESETS.thumbnail);
}

/**
 * Helper to get an optimized card-sized image URL
 */
export function getCardImageUrl(
	imageUrl: string | null | undefined,
): string | null {
	return applyImageTransform(imageUrl, IMAGE_PRESETS.card);
}

/**
 * Helper to get an optimized medium-sized image URL
 */
export function getMediumImageUrl(
	imageUrl: string | null | undefined,
): string | null {
	return applyImageTransform(imageUrl, IMAGE_PRESETS.medium);
}

/**
 * Helper to get an optimized full-sized image URL
 */
export function getFullImageUrl(
	imageUrl: string | null | undefined,
): string | null {
	return applyImageTransform(imageUrl, IMAGE_PRESETS.full);
}
