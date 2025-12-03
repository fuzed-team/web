import { CheckCircle, Clock, XCircle } from "lucide-react";

export const flagStatusOptions = [
	{
		icon: Clock,
		value: "pending",
		label: "Pending",
	},
	{
		icon: CheckCircle,
		value: "reviewed",
		label: "Reviewed",
	},
	{
		icon: XCircle,
		value: "dismissed",
		label: "Dismissed",
	},
];
