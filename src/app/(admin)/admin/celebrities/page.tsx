import { Separator } from "@/components/ui/separator";
import { CelebritiesPrimaryButtons } from "@/features/admin/pages/celebrities/components/celebrity-primary-buttons";
import { CelebritiesDialogs } from "@/features/admin/pages/celebrities/components/dialog/celebrity-dialogs";
import { FeaturedSection } from "@/features/admin/pages/celebrities/components/featured/featured-section";
import { CelebritiesTable } from "@/features/admin/pages/celebrities/components/table/celebrity-table";
import { CelebritiesProvider } from "@/features/admin/pages/celebrities/context/celebrity-context";

export default function CelebritiesPage() {
	return (
		<CelebritiesProvider>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight md:text-3xl">
						Celebrities
					</h1>
					<p className="text-muted-foreground">
						Manage celebrity database and daily featured selections.
					</p>
				</div>
				<CelebritiesPrimaryButtons />
			</div>
			<Separator className="my-4 lg:my-6" />

			<FeaturedSection />

			<Separator className="my-4 lg:my-6" />

			<div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
				<CelebritiesTable />
			</div>
			<CelebritiesDialogs />
		</CelebritiesProvider>
	);
}
