import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/features/auth/api/get-me";
import { useUserPhotos } from "@/features/matching/api/get-user-photos";
import { cn } from "@/lib/utils";
import { BlurImage } from "../blur-image";

interface UserPhotoProps {
	className?: string;
}

export function UserPhoto({ className }: UserPhotoProps) {
	const { data: user, isLoading: isUserLoading } = useMe();
	const { data: userPhotos, isLoading: isPhotosLoading } = useUserPhotos();

	return (
		<div className={cn("", className)}>
			<div className="flex items-center gap-3 mb-2">
				{isUserLoading ? (
					<Skeleton className="w-12 h-12 rounded-full bg-primary/20" />
				) : (
					<BlurImage
						src={user?.image || ""}
						alt="User"
						width={48}
						height={48}
						className="w-12 h-12 rounded-full object-cover border-2 border-sidebar-border shadow-sm"
					/>
				)}
				<div>
					{isUserLoading ? (
						<Skeleton className="bg-primary/20 h-6 w-24" />
					) : (
						<h3 className="font-medium text-base text-sidebar-foreground">
							{user?.name || ""}
						</h3>
					)}
					{/* <div className="w-32 h-1.5 bg-sidebar-accent rounded-full mt-1.5 overflow-hidden">
						<div className="h-full bg-gradient-to-r from-primary w-[110%] rounded-full to-purple-600" />
					</div> */}
					{isPhotosLoading ? (
						<Skeleton className="bg-primary/20 h-3 w-32 mt-1" />
					) : (
						<p className="text-xs text-muted-foreground mt-1">
							{userPhotos?.number_of_faces || 0} Photos Uploaded
						</p>
					)}
				</div>
			</div>
			{/* <button
				type="button"
				className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-md border border-dashed border-sidebar-border text-xs font-medium text-muted-foreground hover:bg-sidebar-accent transition-colors"
			>
				<Upload className="w-3.5 h-3.5" />
				Upload New Photo
			</button> */}
		</div>
	);
}
