import { format } from "date-fns";

export const getTimeAgo = (createdAt: string): string => {
	const now = new Date();
	const created = new Date(createdAt);
	const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
	return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

interface FormatDateOptions {
	period: "date" | "month" | "year" | "datetime" | "dateWeek" | "time";
}

export const formatDate = (
	date: string | Date,
	options?: FormatDateOptions,
) => {
	if (!date) return "";
	switch (options?.period) {
		case "date":
			return format(date, "dd/MM/yyyy");
		case "datetime":
			return format(date, "dd/MM/yyyy HH:mm");
		case "dateWeek":
			return format(date, "dd/MM/yyyy (E)");
		case "month":
			return format(date, "MM/yyyy");
		case "year":
			return format(date, "yyyy");
		case "time":
			return format(date, "HH:mm a");
		default:
			return format(date, "dd/MM/yyyy");
	}
};

export const formatDateISO = (date: string | Date) => {
	return new Date(date).toISOString();
};
