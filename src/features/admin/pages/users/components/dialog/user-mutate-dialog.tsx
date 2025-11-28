"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectDropdown } from "@/components/select-dropdown";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Gender, type UserApi } from "@/types/api";
import { useCreateUser } from "../../api/create-user";
import type { UsersInput } from "../../api/get-users";
import { useUpdateUser } from "../../api/update-user";
import { USER_ROLES } from "../../constants/user-constants";
import { userRoleOptions } from "../../constants/user-options";

const formSchema = z.object({
	name: z
		.string()
		.min(1, { message: "required" })
		.max(15, { message: "maxNameLength" }),
	email: z
		.string()
		.min(1, { message: "required" })
		.email({ message: "invalidEmail" }),
	role: z.enum(USER_ROLES),
	school: z.string().optional(),
	gender: z.nativeEnum(Gender).optional(),
	isEdit: z.boolean(),
});

type UserForm = z.infer<typeof formSchema>;

interface Props {
	currentRow?: UserApi;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function UserMutateDialog({ currentRow, open, onOpenChange }: Props) {
	const searchParams = useSearchParams();
	const isEdit = !!currentRow;

	const page = Number(searchParams.get("page")) || 1;
	const limit = Number(searchParams.get("limit")) || 10;
	const name = searchParams.get("q") || undefined;
	const role = searchParams.get("role") || undefined;
	const createdAtFrom = searchParams.get("createdAtFrom")
		? new Date(searchParams.get("createdAtFrom")!)
		: undefined;
	const createdAtTo = searchParams.get("createdAtTo")
		? new Date(searchParams.get("createdAtTo")!)
		: undefined;

	const usersInput: UsersInput = {
		page,
		limit,
		name,
		role: role ? [role as any] : undefined,
		createdAtFrom: createdAtFrom?.toISOString(),
		createdAtTo: createdAtTo?.toISOString(),
	};

	const createUserMutation = useCreateUser({
		inputQuery: usersInput,
		mutationConfig: {
			onSuccess: handleResetForm,
		},
	});
	const updateUserMutation = useUpdateUser({
		inputQuery: usersInput,
		mutationConfig: {
			onSuccess: handleResetForm,
		},
	});

	const form = useForm<UserForm>({
		resolver: zodResolver(formSchema),
		defaultValues: isEdit
			? {
					name: currentRow?.name!,
					email: currentRow?.email,
					role: currentRow?.role as any,
					school: currentRow?.school || "",
					gender: currentRow?.gender as Gender,
					isEdit,
				}
			: {
					name: "",
					email: "",
					role: "user",
					school: "",
					gender: undefined,
					isEdit,
				},
	});

	const onSubmit = async (values: UserForm) => {
		if (isEdit) {
			updateUserMutation.mutate({
				id: currentRow.id!,
				email: values.email,
				name: values.name,
				role: values.role,
				school: values.school,
				gender: values.gender,
			});
		} else {
			createUserMutation.mutate({
				email: values.email,
				name: values.name,
				role: values.role,
				school: values.school,
				gender: values.gender,
			});
		}
	};

	function handleResetForm() {
		form.reset();
		onOpenChange(false);
	}

	const genderOptions = [
		{ label: "Male", value: "male" },
		{ label: "Female", value: "female" },
		{ label: "Other", value: "other" },
	];

	return (
		<Dialog
			open={open}
			onOpenChange={(state) => {
				form.reset();
				onOpenChange(state);
			}}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="text-left">
					<DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Edit user details."
							: "Add a new user to your organization."}
					</DialogDescription>
				</DialogHeader>
				<div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
					<Form {...form}>
						<form
							id="user-form"
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4 p-0.5"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-right">
											Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter Name"
												autoComplete="new-password"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								disabled={isEdit}
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-right">
											Email
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter Email"
												className="col-span-4"
												autoComplete="new-password"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-right">
											Role
										</FormLabel>
										<SelectDropdown
											defaultValue={field.value}
											onValueChange={field.onChange}
											placeholder="Select Role"
											className="col-span-4"
											items={userRoleOptions}
										/>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="school"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-right">
											School
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter School"
												className="col-span-4"
												{...field}
											/>
										</FormControl>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="gender"
								render={({ field }) => (
									<FormItem className="grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1">
										<FormLabel className="col-span-2 text-right">
											Gender
										</FormLabel>
										<SelectDropdown
											defaultValue={field.value}
											onValueChange={field.onChange}
											placeholder="Select Gender"
											className="col-span-4"
											items={genderOptions}
										/>
										<FormMessage className="col-span-4 col-start-3" />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>
				<DialogFooter>
					<Button
						type="submit"
						form="user-form"
						disabled={createUserMutation.isPending}
					>
						{createUserMutation.isPending
							? "Creating..."
							: isEdit
								? "Update"
								: "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
