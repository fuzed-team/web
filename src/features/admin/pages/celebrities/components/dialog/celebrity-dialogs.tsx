"use client";

import { useCelebrity } from "../../context/celebrity-context";
import { CelebrityDeleteDialog } from "./celebrity-delete-dialog";
import { CelebritySetFeaturedDialog } from "./celebrity-set-featured-dialog";
import { CelebrityViewSheet } from "./celebrity-view-sheet";
import { GenerateDialog } from "./generate-dialog";

export function CelebritiesDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useCelebrity();

	return (
		<>
			<GenerateDialog />

			<CelebrityViewSheet
				open={open === "view"}
				onOpenChange={() => {
					setOpen(null);
					setTimeout(() => setCurrentRow(null), 500);
				}}
				celebrity={currentRow}
			/>

			{currentRow && (
				<>
					<CelebrityDeleteDialog
						key={`celebrity-delete-${currentRow.id}`}
						open={open === "delete"}
						onOpenChange={() => {
							setOpen(null);
							setTimeout(() => setCurrentRow(null), 500);
						}}
						currentRow={currentRow}
					/>

					<CelebritySetFeaturedDialog
						key={`celebrity-set-featured-${currentRow.id}`}
						open={open === "set-featured"}
						onOpenChange={() => {
							setOpen(null);
							setTimeout(() => setCurrentRow(null), 500);
						}}
						currentRow={currentRow}
					/>
				</>
			)}
		</>
	);
}
