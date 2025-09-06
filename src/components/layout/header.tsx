import { Link } from "@tanstack/react-router";
import { AnimatePresence, easeInOut, motion } from "framer-motion";
import { Heart, Menu, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useMe } from "@/features/auth/api/get-me";
import { SignInButton } from "@/features/auth/components/signin-button";
import { SignOutButton } from "@/features/auth/components/signout-button";
import { SignUpButton } from "@/features/auth/components/signup-button";
import { useAuth } from "@/stores/auth-store";
import { ProfileDropdown } from "../profile-dropdown";

interface NavItem {
	name: string;
	href: string;
}

const navItems: NavItem[] = [
	{ name: "Home", href: "/" },
	{ name: "Favorites", href: "/favorites" },
];

export function Header() {
	const { user, setUser } = useAuth();
	const { data, isLoading } = useMe();

	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	React.useEffect(() => {
		if (data) {
			setUser(data);
		}
	}, [data]);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const containerVariants = {
		hidden: { opacity: 0, y: -20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: -10 },
		visible: { opacity: 1, y: 0 },
	};

	const mobileMenuVariants = {
		closed: {
			opacity: 0,
			x: "100%",
			transition: {
				duration: 0.3,
				ease: easeInOut,
			},
		},
		open: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.3,
				ease: easeInOut,
				staggerChildren: 0.1,
			},
		},
	};

	const mobileItemVariants = {
		closed: { opacity: 0, x: 20 },
		open: { opacity: 1, x: 0 },
	};

	return (
		<>
			<motion.header
				className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
					isScrolled
						? "border-border/50 bg-background/80 border-b shadow-sm backdrop-blur-md"
						: "bg-transparent"
				}`}
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<motion.div
							className="flex items-center space-x-3"
							variants={itemVariants}
							whileHover={{ scale: 1.02 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
						>
							<Link to="/" className="flex items-center space-x-3">
								<div className="relative">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 shadow-lg">
										<Heart className="h-5 w-5 text-white" />
									</div>
									<div className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-400"></div>
								</div>
								<div className="flex flex-col">
									<span className="text-foreground text-lg font-bold">
										Fuzed
									</span>
									<span className="text-muted-foreground -mt-1 text-xs">
										Match. Generate. Discover.
									</span>
								</div>
							</Link>
						</motion.div>

						<nav className="hidden items-center space-x-1 lg:flex">
							{navItems.map((item) => (
								<motion.div
									key={item.name}
									variants={itemVariants}
									className="relative"
									onMouseEnter={() => setHoveredItem(item.name)}
									onMouseLeave={() => setHoveredItem(null)}
								>
									<Link
										to={item.href}
										className="text-foreground/80 hover:text-foreground relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
									>
										{hoveredItem === item.name && (
											<motion.div
												className="bg-muted absolute inset-0 rounded-lg"
												layoutId="navbar-hover"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 30,
												}}
											/>
										)}
										<span className="relative z-10">{item.name}</span>
									</Link>
								</motion.div>
							))}
						</nav>

						{isLoading ? (
							<div className="w-12" />
						) : (
							<motion.div
								className="hidden items-center space-x-3 lg:flex"
								variants={itemVariants}
							>
								{user ? (
									<ProfileDropdown />
								) : (
									<>
										<SignInButton />
										<SignUpButton />
									</>
								)}
							</motion.div>
						)}
						<motion.button
							className="text-foreground hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							variants={itemVariants}
							whileTap={{ scale: 0.95 }}
						>
							{isMobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</motion.button>
					</div>
				</div>
			</motion.header>

			<AnimatePresence>
				{isMobileMenuOpen && (
					<>
						<motion.div
							className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						<motion.div
							className="border-border bg-background fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl lg:hidden"
							variants={mobileMenuVariants}
							initial="closed"
							animate="open"
							exit="closed"
						>
							<div className="space-y-6 p-6">
								<div className="space-y-1">
									{navItems.map((item) => (
										<motion.div key={item.name} variants={mobileItemVariants}>
											<Link
												to={item.href}
												className="text-foreground hover:bg-muted block rounded-lg px-4 py-3 font-medium transition-colors duration-200"
												onClick={() => setIsMobileMenuOpen(false)}
											>
												{item.name}
											</Link>
										</motion.div>
									))}
								</div>

								<motion.div
									className="border-border space-y-3 border-t pt-6"
									variants={mobileItemVariants}
								>
									{user ? (
										<SignOutButton className="h-12 w-full" />
									) : (
										<>
											<SignInButton className="h-12 w-full" />
											<SignUpButton className="h-12 justify-center w-full" />
										</>
									)}
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
