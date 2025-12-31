export type AIRole = "user" | "assistant" | "system";

export type AIStreamingState = "idle" | "streaming" | "complete" | "error";

export interface AIMessage {
	id: string;
	role: AIRole;
	content: string;
	created_at: string;
	is_streaming?: boolean;
}

export interface AICelebrity {
	id: string;
	name: string;
	image_url: string;
	category: string;
	bio: string;
}

export interface AIConversation {
	id: string;
	celebrity_id: string;
	celebrity: AICelebrity;
	last_message?: AIMessage;
	updated_at: string;
}
