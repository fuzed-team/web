import type { Database as DB, Tables } from "./database.types";

declare global {
	type Database = DB;
	type Babies = Tables<"babies">;
	type Celebrities = Tables<"celebrities">;
	type Faces = Tables<"faces">;
	type MatchJobs = Tables<"match_jobs">;
	type Matches = Tables<"matches">;
	type Messages = Tables<"messages">;
	type MutualConnections = Tables<"mutual_connections">;
	type Notifications = Tables<"notifications">;
	type Profiles = Tables<"profiles">;
	type Reactions = Tables<"reactions">;
	type SystemSettings = Tables<"system_settings">;
	type UserFlags = Tables<"user_flags">;
}
