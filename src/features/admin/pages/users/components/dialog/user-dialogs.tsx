"use client";

import { useUser } from "../../context/user-context";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserMutateDialog } from "./user-mutate-dialog";

export function UsersDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useUser();
	return (
		<>
			<UserMutateDialog
				key="user-add"
				open={open === "add"}
				onOpenChange={() => setOpen("add")}
			/>

			{currentRow && (
				<>
					<UserMutateDialog
						key={`user-edit-${currentRow.id}`}
						open={open === "edit"}
						onOpenChange={() => {
							setOpen("edit");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<UserDeleteDialog
						key={`user-delete-${currentRow.id}`}
						open={open === "delete"}
						onOpenChange={() => {
							setOpen("delete");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>
				</>
			)}
		</>
	);
}
