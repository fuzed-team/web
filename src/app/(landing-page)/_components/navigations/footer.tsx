import Link from "next/link";

const Footer = () => {
	return (
		<footer className="bg-white border-t border-slate-100 py-10">
			<div className="max-w-7xl mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
								F
							</div>
							<span className="font-bold text-slate-900 text-sm">Fuzzed</span>
						</div>
						<p className="text-xs text-slate-400">
							© {new Date().getFullYear()} Fuzzed Inc. All rights reserved.
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
						<div className="hidden md:block w-px h-4 bg-slate-200" />
						<div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span className="text-[10px] font-medium">Systems Normal</span>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
