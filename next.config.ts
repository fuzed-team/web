import type { NextConfig } from "next";
import "./src/config/env";

const nextConfig: NextConfig = {
	reactStrictMode: true,

	// Image optimization (for Supabase Storage images)
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.supabase.co", // Supabase storage images
			},
			{
				protocol: "https",
				hostname: "avatar.vercel.sh", // Vercel avatar images
			},
			{
				protocol: "https",
				hostname: "fal.media", // FAL.AI baby images
			},
			{
				protocol: "https",
				hostname: "v3b.fal.media", // FAL.AI baby images
			},
			{
				protocol: "https",
				hostname: "image.tmdb.org", // TMDB images
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com", // Unsplash images
			},
		],
		formats: ["image/avif", "image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		minimumCacheTTL: 60,
	},
};

export default nextConfig;
