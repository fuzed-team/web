/**
 * Sanitize a string for use as a filename in Supabase Storage
 * Handles special characters like ø, ñ, ü, dots, etc.
 *
 * @example
 * sanitizeFilename("Kim S. Falck-Jørgensen") // "kim-s-falck-jorgensen"
 * sanitizeFilename("José García") // "jose-garcia"
 */
export function sanitizeFilename(name: string): string {
	return (
		name
			.toLowerCase()
			// Normalize Unicode characters (ø → o, ñ → n, etc.)
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			// Replace spaces and underscores with dashes
			.replace(/[\s_]+/g, "-")
			// Remove any character that isn't alphanumeric or dash
			.replace(/[^a-z0-9-]/g, "")
			// Remove multiple consecutive dashes
			.replace(/-+/g, "-")
			// Remove leading/trailing dashes
			.replace(/^-|-$/g, "")
	);
}
