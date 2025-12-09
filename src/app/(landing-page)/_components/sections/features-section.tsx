"use client";

import { CampusConnectCard } from "../features/campus-connect-card";
import { CelebrityMatchCard } from "../features/celebrity-match-card";
import { FutureGeneratorCard } from "../features/future-generator-card";
import { WebChatCard } from "../features/web-chat-card";
import AnimationContainer from "../global/animation-container";
import MaxWidthWrapper from "../global/max-widht-wrapper";

export function FeaturesSection() {
	return (
		<section className="md:py-32 bg-white pt-20 pb-20" id="features">
			<MaxWidthWrapper>
				<AnimationContainer delay={0.2}>
					<div className="mb-16 md:mb-24 max-w-2xl">
						<h2 className="md:text-5xl text-3xl font-medium text-slate-900 tracking-tight mb-6">
							Your face is your
							<br />
							<span className="text-indigo-600">social key.</span>
						</h2>
						<p className="text-slate-500 text-lg font-light leading-relaxed">
							One scan unlocks a suite of social tools designed to find your
							people, your lookalikes, and your future. All secure, all on the
							web.
						</p>
					</div>
				</AnimationContainer>

				{/* Bento Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Row 1: 1x1 + 2x1 */}
					<CampusConnectCard />
					<div className="md:col-span-2">
						<CelebrityMatchCard />
					</div>

					{/* Row 2: 2x1 + 1x1 */}
					<div className="md:col-span-2">
						<FutureGeneratorCard />
					</div>
					<WebChatCard />
				</div>
			</MaxWidthWrapper>
		</section>
	);
}
