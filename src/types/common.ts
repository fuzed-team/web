export interface Pagination {
	currentPage: number;
	limit: number;
	totalPages?: number;
	totalRecords?: number;
}

export interface SelectOption {
	label: string;
	value: string;
}

export interface PaginationInput {
	page?: number;
	limit?: number;
	q?: string;
	sort?: string;
}

export interface MutationOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export interface DataTableOption {
	label: string;
	value: string;
	icon?: React.ComponentType<{ className?: string }>;
	withCount?: boolean;
}

export interface DataTableFilterField<TData> {
	label: string;
	value: keyof TData;
	placeholder?: string;
	options?: DataTableOption[];
	multiple?: boolean;
}
