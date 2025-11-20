/** biome-ignore-all lint/a11y/useButtonType: false positive */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const colors = {
	50: "#fff1f2",
	100: "#ffe4e6",
	200: "#fecdd3",
	300: "#fda4af",
	400: "#fb7185",
	500: "#f43f5e",
	600: "#e11d48",
	700: "#be123c",
	800: "#9f1239",
	900: "#881337",
};

export default function StudentLanding() {
	const router = useRouter();
	const gradientRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Animate words
		const words = document.querySelectorAll<HTMLElement>(".word");
		words.forEach((word) => {
			const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
			setTimeout(() => {
				word.style.animation = "word-appear 0.8s ease-out forwards";
			}, delay);
		});

		// Mouse gradient
		const gradient = gradientRef.current;
		function onMouseMove(e: MouseEvent) {
			if (gradient) {
				gradient.style.left = e.clientX - 192 + "px";
				gradient.style.top = e.clientY - 192 + "px";
				gradient.style.opacity = "1";
			}
		}
		function onMouseLeave() {
			if (gradient) gradient.style.opacity = "0";
		}
		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseleave", onMouseLeave);

		// Word hover effects
		words.forEach((word) => {
			word.addEventListener("mouseenter", () => {
				word.style.textShadow = "0 0 20px rgba(251, 113, 133, 0.5)";
			});
			word.addEventListener("mouseleave", () => {
				word.style.textShadow = "none";
			});
		});

		// Click ripple effect
		function onClick(e: MouseEvent) {
			const ripple = document.createElement("div");
			ripple.style.position = "fixed";
			ripple.style.left = e.clientX + "px";
			ripple.style.top = e.clientY + "px";
			ripple.style.width = "4px";
			ripple.style.height = "4px";
			ripple.style.background = "rgba(251, 113, 133, 0.6)";
			ripple.style.borderRadius = "50%";
			ripple.style.transform = "translate(-50%, -50%)";
			ripple.style.pointerEvents = "none";
			ripple.style.animation = "pulse-glow 1s ease-out forwards";
			document.body.appendChild(ripple);
			setTimeout(() => ripple.remove(), 1000);
		}
		document.addEventListener("click", onClick);

		// Floating elements on scroll
		let scrolled = false;
		function onScroll() {
			if (!scrolled) {
				scrolled = true;
				document
					.querySelectorAll<HTMLElement>(".floating-element")
					.forEach((el, index) => {
						setTimeout(() => {
							el.style.animationPlayState = "running";
						}, index * 200);
					});
			}
		}
		window.addEventListener("scroll", onScroll);

		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseleave", onMouseLeave);
			document.removeEventListener("click", onClick);
			window.removeEventListener("scroll", onScroll);
		};
	}, []);

	return (
		<div className="font-primary relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-rose-950 via-black to-rose-900 text-rose-100">
			<style jsx global>{`
				@keyframes word-appear {
					0% { opacity: 0; transform: translateY(20px); }
					100% { opacity: 1; transform: translateY(0); }
				}
				@keyframes pulse-glow {
					0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
					100% { transform: translate(-50%, -50%) scale(20); opacity: 0; }
				}
				.word { opacity: 0; display: inline-block; margin-right: 0.25em; transition: text-shadow 0.3s ease; }
				.grid-line { stroke: rgba(251, 113, 133, 0.1); stroke-width: 1; opacity: 0; animation: fade-in 1s ease-out forwards; }
				.detail-dot { fill: ${colors[400]}; opacity: 0; animation: scale-in 0.5s ease-out forwards; }
				.corner-element { position: absolute; width: 2rem; height: 2rem; opacity: 0; animation: fade-in 1s ease-out forwards; }
				.floating-element { position: absolute; width: 4px; height: 4px; background: ${colors[200]}; border-radius: 50%; opacity: 0.5; animation: float 6s infinite ease-in-out paused; }
				@keyframes float {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-20px); }
				}
				@keyframes fade-in { to { opacity: 1; } }
				@keyframes scale-in { to { opacity: 1; transform: scale(1); } }
			`}</style>

			{/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				className="absolute inset-0 h-full w-full"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<pattern
						id="grid"
						width="60"
						height="60"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 60 0 L 0 0 0 60"
							fill="none"
							stroke="rgba(251, 113, 133, 0.08)"
							strokeWidth="0.5"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#grid)" />
				<line
					x1="0"
					y1="20%"
					x2="100%"
					y2="20%"
					className="grid-line"
					style={{ animationDelay: "0.5s" }}
				/>
				<line
					x1="0"
					y1="80%"
					x2="100%"
					y2="80%"
					className="grid-line"
					style={{ animationDelay: "1s" }}
				/>
				<line
					x1="20%"
					y1="0"
					x2="20%"
					y2="100%"
					className="grid-line"
					style={{ animationDelay: "1.5s" }}
				/>
				<line
					x1="80%"
					y1="0"
					x2="80%"
					y2="100%"
					className="grid-line"
					style={{ animationDelay: "2s" }}
				/>
				<line
					x1="50%"
					y1="0"
					x2="50%"
					y2="100%"
					className="grid-line"
					style={{ animationDelay: "2.5s", opacity: 0.05 }}
				/>
				<line
					x1="0"
					y1="50%"
					x2="100%"
					y2="50%"
					className="grid-line"
					style={{ animationDelay: "3s", opacity: 0.05 }}
				/>
				<circle
					cx="20%"
					cy="20%"
					r="2"
					className="detail-dot"
					style={{ animationDelay: "3s" }}
				/>
				<circle
					cx="80%"
					cy="20%"
					r="2"
					className="detail-dot"
					style={{ animationDelay: "3.2s" }}
				/>
				<circle
					cx="20%"
					cy="80%"
					r="2"
					className="detail-dot"
					style={{ animationDelay: "3.4s" }}
				/>
				<circle
					cx="80%"
					cy="80%"
					r="2"
					className="detail-dot"
					style={{ animationDelay: "3.6s" }}
				/>
				<circle
					cx="50%"
					cy="50%"
					r="1.5"
					className="detail-dot"
					style={{ animationDelay: "4s" }}
				/>
			</svg>

			{/* Corner elements */}
			<div
				className="corner-element top-8 left-8"
				style={{ animationDelay: "4s" }}
			>
				<div
					className="absolute top-0 left-0 h-2 w-2 opacity-30"
					style={{ background: colors[200] }}
				></div>
			</div>
			<div
				className="corner-element top-8 right-8"
				style={{ animationDelay: "4.2s" }}
			>
				<div
					className="absolute top-0 right-0 h-2 w-2 opacity-30"
					style={{ background: colors[200] }}
				></div>
			</div>
			<div
				className="corner-element bottom-8 left-8"
				style={{ animationDelay: "4.4s" }}
			>
				<div
					className="absolute bottom-0 left-0 h-2 w-2 opacity-30"
					style={{ background: colors[200] }}
				></div>
			</div>
			<div
				className="corner-element right-8 bottom-8"
				style={{ animationDelay: "4.6s" }}
			>
				<div
					className="absolute right-0 bottom-0 h-2 w-2 opacity-30"
					style={{ background: colors[200] }}
				></div>
			</div>

			{/* Floating elements */}
			<div
				className="floating-element"
				style={{ top: "25%", left: "15%", animationDelay: "5s" }}
			></div>
			<div
				className="floating-element"
				style={{ top: "60%", left: "85%", animationDelay: "5.5s" }}
			></div>
			<div
				className="floating-element"
				style={{ top: "40%", left: "10%", animationDelay: "6s" }}
			></div>
			<div
				className="floating-element"
				style={{ top: "75%", left: "90%", animationDelay: "6.5s" }}
			></div>

			<div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-8 py-12 md:px-16 md:py-20">
				{/* Top tagline */}
				<div className="text-center">
					<h2
						className="font-mono text-xs font-light tracking-[0.2em] uppercase opacity-80 md:text-sm"
						style={{ color: colors[200] }}
					>
						<span className="word" data-delay="0">
							#1
						</span>
						<span className="word" data-delay="200">
							Trending
						</span>
						<span className="word" data-delay="400">
							<b>App</b>
						</span>
						<span className="word" data-delay="600">
							on
						</span>
						<span className="word" data-delay="800">
							Campus
						</span>
					</h2>
					<div
						className="mt-4 h-px w-16 opacity-30 mx-auto"
						style={{
							background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)`,
						}}
					></div>
				</div>

				{/* Main headline */}
				<div className="mx-auto max-w-5xl text-center">
					<h1
						className="text-decoration text-3xl leading-tight font-extralight tracking-tight md:text-5xl lg:text-6xl"
						style={{ color: colors[50] }}
					>
						<div className="mb-4 md:mb-6">
							<span className="word" data-delay="1000">
								See
							</span>
							<span className="word" data-delay="1150">
								Your
							</span>
							<span className="word" data-delay="1300">
								Future
							</span>
							<span className="word" data-delay="1450">
								Baby
							</span>
						</div>
						<div
							className="text-2xl leading-relaxed font-thin md:text-3xl lg:text-4xl"
							style={{ color: colors[200] }}
						>
							<span className="word" data-delay="1600">
								with
							</span>
							<span className="word" data-delay="1750">
								your
							</span>
							<span className="word" data-delay="1900">
								campus
							</span>
							<span className="word" data-delay="2050">
								crush.
							</span>
						</div>
					</h1>

					<div
						className="mt-12 opacity-0"
						style={{
							animation: "fade-in 1s ease-out forwards",
							animationDelay: "2.5s",
						}}
					>
						{/* <SignUpButton className="text-lg py-6 px-8 bg-rose-600 hover:bg-rose-500 text-white border-none shadow-[0_0_30px_rgba(244,63,94,0.4)]" /> */}

						<div className="items-center justify-center space-y-3 gap-x-3 sm:flex sm:space-y-0">
							<span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
								<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ffe4e6_0%,#e11d48_50%,#ffe4e6_100%)]" />
								<div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-950 text-xs font-medium text-gray-50 backdrop-blur-3xl">
									<button
										onClick={() => router.push("/auth/sign-in")}
										className="group border-input inline-flex w-full items-center justify-center rounded-full border-[1px] bg-gradient-to-tr from-rose-300/5 via-rose-400/20 to-transparent px-10 py-4 text-center text-white transition-colors hover:bg-transparent/90 sm:w-auto"
									>
										Get Started
									</button>
								</div>
							</span>
						</div>
					</div>

					<div
						className="absolute top-1/2 -left-8 h-px w-4 opacity-20"
						style={{
							background: colors[200],
							animation: "word-appear 1s ease-out forwards",
							animationDelay: "3.5s",
						}}
					></div>
					<div
						className="absolute top-1/2 -right-8 h-px w-4 opacity-20"
						style={{
							background: colors[200],
							animation: "word-appear 1s ease-out forwards",
							animationDelay: "3.7s",
						}}
					></div>
				</div>

				{/* Bottom tagline */}
				<div className="text-center">
					<div
						className="mb-4 h-px w-16 opacity-30 mx-auto"
						style={{
							background: `linear-gradient(to right, transparent, ${colors[200]}, transparent)`,
						}}
					></div>
					<h2
						className="font-mono text-xs font-light tracking-[0.2em] uppercase opacity-80 md:text-sm"
						style={{ color: colors[200] }}
					>
						<span className="word" data-delay="3000">
							Baby Generator
						</span>
						<span className="word" data-delay="3150">
							•
						</span>
						<span className="word" data-delay="3300">
							Campus Matches
						</span>
						<span className="word" data-delay="3450">
							•
						</span>
						<span className="word" data-delay="3600">
							Instant Chat
						</span>
					</h2>
					<div
						className="mt-6 flex justify-center space-x-4 opacity-0"
						style={{
							animation: "word-appear 1s ease-out forwards",
							animationDelay: "4s",
						}}
					>
						<div
							className="h-1 w-1 rounded-full opacity-40"
							style={{ background: colors[200] }}
						></div>
						<div
							className="h-1 w-1 rounded-full opacity-60"
							style={{ background: colors[200] }}
						></div>
						<div
							className="h-1 w-1 rounded-full opacity-40"
							style={{ background: colors[200] }}
						></div>
					</div>
				</div>
			</div>

			<div
				id="mouse-gradient"
				ref={gradientRef}
				className="pointer-events-none fixed h-96 w-96 rounded-full opacity-0 blur-3xl transition-all duration-500 ease-out"
				style={{
					background: `radial-gradient(circle, ${colors[500]}0D 0%, transparent 100%)`,
				}}
			></div>
		</div>
	);
}
