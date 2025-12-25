import { Download, Share2, Sparkles } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import type { CelebrityBabyListItem } from "@/features/matching/api/get-celebrity-baby-list";
import { getTimeAgo } from "@/lib/utils/date";

interface CelebrityGenerationCardProps {
	baby: CelebrityBabyListItem;
}

export function CelebrityGenerationCard({
	baby,
}: CelebrityGenerationCardProps) {
	// Get the first baby image to display
	const babyImage = baby.images[0]?.image_url;

	const handleDownload = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (babyImage) {
			window.open(babyImage, "_blank");
		}
	};

	const handleShare = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (navigator.share && babyImage) {
			navigator.share({
				title: `Baby with ${baby.celebrity.name}`,
				url: babyImage,
			});
		}
	};

	return (
		<div className="group relative flex flex-col border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/30 hover:shadow-primary/10 cursor-pointer">
			{/* Image Container */}
			<div className="relative aspect-square overflow-hidden bg-muted">
				{babyImage ? (
					<BlurImage
						src={babyImage}
						alt="Generated Baby"
						width={600}
						height={600}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-4xl">
						👶
					</div>
				)}

				{/* Overlay Actions (Hidden by default, shown on hover) */}
				<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px] bg-background/40">
					<button
						type="button"
						onClick={handleDownload}
						className="p-2.5 rounded-full transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Download className="w-4 h-4" />
					</button>
					<button
						type="button"
						onClick={handleShare}
						className="p-2.5 rounded-full transition-colors backdrop-blur-md shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300 delay-75 bg-foreground/20 text-foreground hover:bg-foreground/30"
					>
						<Share2 className="w-4 h-4" />
					</button>
				</div>

				{/* Time Badge */}
				<div className="absolute top-3 right-3 px-2 py-1 backdrop-blur-md rounded-md border text-[10px] font-medium bg-background/60 border-border/50 text-foreground">
					{getTimeAgo(baby.created_at)}
				</div>
			</div>

			{/* Details */}
			<div className="p-4 bg-linear-to-b from-card to-muted/50">
				<div className="flex items-center justify-between">
					<div className="flex items-center -space-x-2">
						<BlurImage
							src={baby.me.image || ""}
							alt={baby.me.name}
							width={100}
							height={100}
							className="w-8 h-8 rounded-full ring-2 ring-card object-cover"
							title="You"
						/>
						<BlurImage
							src={baby.celebrity.image || ""}
							alt={baby.celebrity.name}
							width={100}
							height={100}
							className="w-8 h-8 rounded-full ring-2 ring-primary/50 object-cover bg-background"
							title={baby.celebrity.name}
						/>
					</div>
					<div className="text-right">
						<div className="text-sm text-muted-foreground">
							with{" "}
							<span className="font-medium text-primary">
								{baby.celebrity.name}
							</span>
						</div>
						{baby.celebrity.category && (
							<div className="text-[10px] text-muted-foreground">
								{baby.celebrity.category}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
