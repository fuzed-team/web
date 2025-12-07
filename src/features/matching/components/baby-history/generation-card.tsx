import { ArrowRight, Download, Share2 } from "lucide-react";
import { BlurImage } from "@/components/blur-image";
import type { BabyListItem } from "@/features/matching/api/get-baby-list";
import { getTimeAgo } from "@/lib/utils/date";

interface GenerationCardProps {
	baby: BabyListItem;
}

export function GenerationCard({ baby }: GenerationCardProps) {
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
				title: `Baby with ${baby.other.name}`,
				url: babyImage,
			});
		}
	};

	return (
		<div className="group relative flex flex-col border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/20 hover:shadow-primary/10 cursor-pointer">
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
			<div className="p-4 bg-gradient-to-b from-card to-muted/50">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center -space-x-2">
						<BlurImage
							src={baby.me.image || ""}
							alt={baby.me.name}
							width={100}
							height={100}
							className="w-8 h-8 rounded-full border-2 object-cover border-card"
							title="You"
						/>
						<BlurImage
							src={baby.other.image || ""}
							alt={baby.other.name}
							width={100}
							height={100}
							className="w-8 h-8 rounded-full border-2 object-cover border-card"
							title={baby.other.name}
						/>
					</div>
					<div className="text-right">
						<div className="text-xs text-muted-foreground">
							with{" "}
							<span className="font-medium text-foreground">
								{baby.other.name}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
