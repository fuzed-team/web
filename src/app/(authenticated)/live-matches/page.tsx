// COMMENTED OUT 2025-11-18: Per client feedback, removed public live matches feed
// Users should only see their own matches on /your-matches
// Keeping code for potential future use

/*
"use client";

import { LiveMatch } from "@/features/matching/components/live-match/live-match";

export default function LiveMatchesPage() {
	return <LiveMatch />;
}
*/

// Redirect to Your Matches page
import { redirect } from "next/navigation";

export default function LiveMatchesPage() {
	redirect("/your-matches");
}
