import AnimationContainer from "../global/animation-container";
import { Icons } from "../global/icons";

const Footer = () => {
	return (
		<footer className="flex flex-col relative items-center justify-center border-t border-border pt-16 pb-8 px-6 lg:px-8 w-full max-w-6xl mx-auto bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]">
			<div className="absolute top-0 left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-foreground rounded-full"></div>

			<div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full">
				<AnimationContainer delay={0.1}>
					<div className="flex flex-col items-start justify-start md:max-w-[200px]">
						<div className="flex items-start">
							<Icons.logo className="w-7 h-7" />
						</div>
						<p className="text-neutral-400 mt-4 text-sm text-start">
							Find your face match with AI-powered technology.
						</p>
						<span className="mt-4 text-neutral-00 text-sm flex items-center">
							Made with ❤️ for connecting people
						</span>
					</div>
				</AnimationContainer>
			</div>

			<div className="mt-8 border-t border-border/40 pt-4 md:pt-8 md:flex md:items-center md:justify-between w-full">
				<AnimationContainer delay={0.6}>
					<p className="text-sm text-neutral-600 mt-8 md:mt-0">
						&copy; {new Date().getFullYear()} Fuzed. All rights reserved.
					</p>
				</AnimationContainer>
			</div>
		</footer>
	);
};

export default Footer;
