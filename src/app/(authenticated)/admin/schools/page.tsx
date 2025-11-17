"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { AdminContentSection } from "@/features/admin/components/admin-content-section";
import { useSchoolStatistics } from "@/features/admin/api/get-school-statistics";
import { toast } from "sonner";

export default function SchoolsAdminPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, isLoading, error } = useSchoolStatistics();

	// Filter schools based on search query
	const filteredSchools = data?.schools.filter((school) =>
		school.school.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Export to CSV
	const handleExportCSV = () => {
		if (!data?.schools || data.schools.length === 0) {
			toast.error("No data to export");
			return;
		}

		// Create CSV content
		const headers = [
			"School Name",
			"Total Users",
			"Active Users (7d)",
			"Total Matches",
			"Avg Matches/User",
		];
		const rows = data.schools.map((school) => [
			school.school,
			school.total_users,
			school.active_users_7d,
			school.total_matches,
			school.avg_matches_per_user,
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.join(",")),
		].join("\n");

		// Create download link
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`school-statistics-${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success("School statistics exported successfully!");
	};

	if (error) {
		return (
			<AdminContentSection
				title="School Management"
				desc="View and manage schools in the system."
			>
				<div className="text-center py-8 text-red-500">
					Error loading school statistics. Please try again later.
				</div>
			</AdminContentSection>
		);
	}

	return (
		<AdminContentSection
			title="School Management"
			desc="View all schools in the system with user and match statistics."
		>
			<div className="space-y-6">
				{/* Header Actions */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					{/* Search */}
					<div className="relative w-full sm:w-96">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<Input
							placeholder="Search schools..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>

					{/* Export Button */}
					<Button
						onClick={handleExportCSV}
						variant="outline"
						className="w-full sm:w-auto"
						disabled={isLoading || !data?.schools.length}
					>
						<Download className="w-4 h-4 mr-2" />
						Export CSV
					</Button>
				</div>

				{/* Stats Summary */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="bg-muted/50 rounded-lg p-4">
						<p className="text-sm text-muted-foreground">Total Schools</p>
						<p className="text-2xl font-bold">
							{isLoading ? "-" : data?.total_schools || 0}
						</p>
					</div>
					<div className="bg-muted/50 rounded-lg p-4">
						<p className="text-sm text-muted-foreground">Total Users</p>
						<p className="text-2xl font-bold">
							{isLoading
								? "-"
								: data?.schools.reduce(
										(sum, school) => sum + school.total_users,
										0,
									) || 0}
						</p>
					</div>
					<div className="bg-muted/50 rounded-lg p-4">
						<p className="text-sm text-muted-foreground">Total Matches</p>
						<p className="text-2xl font-bold">
							{isLoading
								? "-"
								: data?.schools.reduce(
										(sum, school) => sum + school.total_matches,
										0,
									) || 0}
						</p>
					</div>
				</div>

				{/* Schools Table */}
				<div className="border rounded-lg overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[40%]">School Name</TableHead>
								<TableHead className="text-right">Total Users</TableHead>
								<TableHead className="text-right">Active (7d)</TableHead>
								<TableHead className="text-right">Matches</TableHead>
								<TableHead className="text-right">Avg Matches/User</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-8">
										<div className="flex items-center justify-center gap-2">
											<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
											Loading school statistics...
										</div>
									</TableCell>
								</TableRow>
							) : filteredSchools && filteredSchools.length > 0 ? (
								filteredSchools.map((school) => (
									<TableRow key={school.school}>
										<TableCell className="font-medium">
											{school.school}
										</TableCell>
										<TableCell className="text-right">
											{school.total_users.toLocaleString()}
										</TableCell>
										<TableCell className="text-right">
											<span
												className={
													school.active_users_7d > 0
														? "text-green-600 font-medium"
														: ""
												}
											>
												{school.active_users_7d.toLocaleString()}
											</span>
										</TableCell>
										<TableCell className="text-right">
											{school.total_matches.toLocaleString()}
										</TableCell>
										<TableCell className="text-right">
											{school.avg_matches_per_user}
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} className="text-center py-8">
										{searchQuery
											? "No schools found matching your search."
											: "No schools found in the system."}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</AdminContentSection>
	);
}
