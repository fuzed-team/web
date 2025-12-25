export type BabyApi = {
	id: string;
	match_id: string;
	image_url: string;
	created_at: string; // ISO timestamp
	generated_by_profile_id: string;
	parents: {
		a: ParentInfo;
		b: ParentInfo;
	};
};

export type ParentInfo = {
	id: string;
	name: string;
	gender: "male" | "female" | string;
};

export type UniversityMatch = {
	id: string;
	me: {
		name: string;
		image: string;
		age: number;
		school: string;
	};
	other: {
		name: string;
		image: string;
		age: number;
		school: string;
	};
	matchPercentage: number;
	numberOfMatches: number;
	timestamp: string;
	isNew: boolean;
	isFavorited?: boolean;
	matches: Array<{
		id: string;
		createdAt: string;
		name: string;
		image: string;
		school: string;
		reactions: Record<string, number>;
		matchPercentage: number;
		isNew?: boolean;
	}>;
};

export type MatchData = {
	id: string;
	user1: {
		name: string;
		image: string;
		school?: string;
	};
	user2: {
		name: string;
		image: string;
		school?: string;
	};
	matchPercentage: number;
	timestamp: string;
	isNew?: boolean;
	isViewed?: boolean;
	isFavorited?: boolean;
};
