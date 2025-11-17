/**
 * Utility for generating natural language match messages based on commonalities
 * @module generate-match-message
 */

export interface Commonality {
	type: "age" | "geometry" | "symmetry" | "skin_tone" | "expression";
	message: string;
	detail?: string;
}

/**
 * Generates a natural language message describing what two users have in common
 * @param commonalities - Array of detected commonalities
 * @returns Human-readable match message
 *
 * @example
 * ```ts
 * const commonalities = [
 *   { type: 'age', message: 'similar age' },
 *   { type: 'geometry', message: 'similar facial features' }
 * ];
 * generateMatchMessage(commonalities);
 * // Returns: "It's a match! You both have similar age and similar facial features."
 * ```
 */
export function generateMatchMessage(commonalities: Commonality[]): string {
	if (!commonalities || commonalities.length === 0) {
		return "It's a match!";
	}

	// Extract messages
	const messages = commonalities.map((c) => c.message);

	// Single commonality
	if (messages.length === 1) {
		return `It's a match! You both have ${messages[0]}.`;
	}

	// Two commonalities
	if (messages.length === 2) {
		return `It's a match! You both have ${messages[0]} and ${messages[1]}.`;
	}

	// Three or more commonalities - use Oxford comma
	const lastMessage = messages.pop();
	return `It's a match! You both have ${messages.join(", ")}, and ${lastMessage}.`;
}

/**
 * Generates a short summary of commonalities (for notifications/toasts)
 * @param commonalities - Array of detected commonalities
 * @returns Short summary string
 *
 * @example
 * ```ts
 * const commonalities = [
 *   { type: 'age', message: 'similar age' },
 *   { type: 'geometry', message: 'similar facial features' }
 * ];
 * generateShortSummary(commonalities);
 * // Returns: "2 things in common"
 * ```
 */
export function generateShortSummary(commonalities: Commonality[]): string {
	const count = commonalities?.length || 0;

	if (count === 0) {
		return "You matched!";
	}

	if (count === 1) {
		return "1 thing in common";
	}

	return `${count} things in common`;
}

/**
 * Gets a prioritized list of commonalities (for UI display)
 * Priority order: geometry > age > symmetry > skin_tone > expression
 * @param commonalities - Array of detected commonalities
 * @returns Sorted array of commonalities
 */
export function prioritizeCommonalities(
	commonalities: Commonality[],
): Commonality[] {
	const priorityOrder: Record<Commonality["type"], number> = {
		geometry: 1,
		age: 2,
		symmetry: 3,
		skin_tone: 4,
		expression: 5,
	};

	return [...commonalities].sort((a, b) => {
		return priorityOrder[a.type] - priorityOrder[b.type];
	});
}
