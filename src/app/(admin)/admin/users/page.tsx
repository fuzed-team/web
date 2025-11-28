import { UsersTable } from "@/features/admin/pages/users/components/table/user-table";
import { UsersPrimaryButtons } from "@/features/admin/pages/users/components/user-primary-buttons";

export default function UsersPage() {
	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">User List</h2>
					<p className="text-muted-foreground">
						Manage your users and their roles here.
					</p>
				</div>
				<UsersPrimaryButtons />
			</div>
			<div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
				<UsersTable />
			</div>
		</>
	);
}
