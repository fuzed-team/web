import { UsersPrimaryButtons } from "@/features/admin/pages/users/components/users-primary-buttons";
import { UsersTable } from "@/features/admin/pages/users/components/users-table";

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
			{/* <UsersTable data={users} search={search} navigate={navigate} /> */}
		</>
	);
}
