import Link from "next/link";
import Logo from "@/assets/logo";

const Footer = () => {
	return (
		<footer className="bg-white border-t border-slate-100 py-10">
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
						<div className="flex items-center">
							<Logo className="size-6" />
							<span className="font-bold text-slate-900 text-sm -ml-1 leading-none">
								uzed
							</span>
						</div>
						<p className="text-xs text-slate-400">
							© {new Date().getFullYear()} Fuzed Inc. All rights reserved.
						</p>
					</div>
					<div className="flex items-center gap-6">
						<Link
							href="/privacy"
							className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
						>
							Privacy Policy
						</Link>
						<Link
							href="/terms"
							className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
						>
							Terms of Service
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
