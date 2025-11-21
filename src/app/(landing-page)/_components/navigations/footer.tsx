import Link from "next/link";
import AnimationContainer from "../global/animation-container";
import { Icons } from "../global/icons";
import { TextHoverEffect } from "../ui/text-hover-effect";

const Footer = () => {
	return (
		<footer className="flex flex-col relative items-center justify-center border-t border-border pt-16 pb-8 md:pb-0 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32 bg-[radial-gradient(35%_128px_at_50%_0%,theme(backgroundColor.white/8%),transparent)]">
			<div className="absolute top-0 left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-foreground rounded-full"></div>

			<div className="grid gap-8 xl:grid-cols-3 xl:gap-8 w-full">
				<AnimationContainer delay={0.1}>
					<div className="flex flex-col items-start justify-start md:max-w-[200px]">
						<div className="flex items-start">
							<Icons.logo className="w-7 h-7" />
						</div>
						<p className="text-muted-foreground mt-4 text-sm text-start">
							Find your face match with AI-powered technology.
						</p>
						<span className="mt-4 text-neutral-200 text-sm flex items-center">
							Made with ❤️ for connecting people
						</span>
					</div>
				</AnimationContainer>

				<div className="grid-cols-2 gap-8 grid mt-16 xl:col-span-2 xl:mt-0">
					<div className="md:grid md:grid-cols-2 md:gap-8">
						<AnimationContainer delay={0.2}>
							<div className="">
								<h3 className="text-base font-medium text-white">Product</h3>
								<ul className="mt-4 text-sm text-muted-foreground">
									<li className="mt-2">
										<Link
											href="/how-it-works"
											className="hover:text-foreground transition-all duration-300"
										>
											How It Works
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/#features"
											className="hover:text-foreground transition-all duration-300"
										>
											Features
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/your-matches"
											className="hover:text-foreground transition-all duration-300"
										>
											Get Started
										</Link>
									</li>
								</ul>
							</div>
						</AnimationContainer>
						<AnimationContainer delay={0.3}>
							<div className="mt-10 md:mt-0 flex flex-col">
								<h3 className="text-base font-medium text-white">
									Features
								</h3>
								<ul className="mt-4 text-sm text-muted-foreground">
									<li className="">
										<Link
											href="/#features"
											className="hover:text-foreground transition-all duration-300"
										>
											Face Matching
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/#features"
											className="hover:text-foreground transition-all duration-300"
										>
											Celebrity Lookalikes
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/#features"
											className="hover:text-foreground transition-all duration-300"
										>
											AI Baby Generator
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/#features"
											className="hover:text-foreground transition-all duration-300"
										>
											Real-time Chat
										</Link>
									</li>
								</ul>
							</div>
						</AnimationContainer>
					</div>
					<div className="md:grid md:grid-cols-2 md:gap-8">
						<AnimationContainer delay={0.4}>
							<div className="">
								<h3 className="text-base font-medium text-white">Support</h3>
								<ul className="mt-4 text-sm text-muted-foreground">
									<li className="mt-2">
										<Link
											href="/#faq"
											className="hover:text-foreground transition-all duration-300"
										>
											FAQ
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/privacy"
											className="hover:text-foreground transition-all duration-300"
										>
											Privacy Policy
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="/terms"
											className="hover:text-foreground transition-all duration-300"
										>
											Terms of Service
										</Link>
									</li>
								</ul>
							</div>
						</AnimationContainer>
						<AnimationContainer delay={0.5}>
							<div className="mt-10 md:mt-0 flex flex-col">
								<h3 className="text-base font-medium text-white">Connect</h3>
								<ul className="mt-4 text-sm text-muted-foreground">
									<li className="">
										<Link
											href="#"
											className="hover:text-foreground transition-all duration-300"
										>
											Twitter
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="#"
											className="hover:text-foreground transition-all duration-300"
										>
											Instagram
										</Link>
									</li>
									<li className="mt-2">
										<Link
											href="#"
											className="hover:text-foreground transition-all duration-300"
										>
											Discord
										</Link>
									</li>
								</ul>
							</div>
						</AnimationContainer>
					</div>
				</div>
			</div>

			<div className="mt-8 border-t border-border/40 pt-4 md:pt-8 md:flex md:items-center md:justify-between w-full">
				<AnimationContainer delay={0.6}>
					<p className="text-sm text-muted-foreground mt-8 md:mt-0">
						&copy; {new Date().getFullYear()} Fuzed. All rights reserved.
					</p>
				</AnimationContainer>
			</div>

			<div className="h-[20rem] lg:h-[20rem] hidden md:flex items-center justify-center">
				<TextHoverEffect text="FUZED" />
			</div>
		</footer>
	);
};

export default Footer;
