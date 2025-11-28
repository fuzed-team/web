"use client";

import { IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { useCreateUsers } from "../api/create-users";
import { useUser } from "../context/user-context";
import { generateRandomUsers } from "../utils/ramdom-users";

export function UsersPrimaryButtons() {
	const { setOpen } = useUser();
	const createUsersMutation = useCreateUsers();

	const handleCreateRandomUsers = async () => {
		if (createUsersMutation.isPending) return;
		const users = generateRandomUsers(5);
		await createUsersMutation.mutateAsync({ users });
	};

	return (
		<div className="flex gap-2">
			<Button className="space-x-1" onClick={() => setOpen("add")}>
				<span>Add User</span> <IconUserPlus size={18} />
			</Button>
			<Button
				className="space-x-1"
				disabled={createUsersMutation.isPending}
				onClick={handleCreateRandomUsers}
			>
				<span>Create Random Users</span>
			</Button>
		</div>
	);
}
