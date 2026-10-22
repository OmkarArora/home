import type { Metadata } from "next";

import { PageHead, label, mono } from "@/components/lab/a/ui";
import { canonical } from "@/lib/site-seo";

export const metadata: Metadata = {
	title: "Arcade — Omkar Arora",
	description: "Playable interface experiments by Omkar Arora. Under construction.",
	...canonical("/arcade"),
};

/** Caution stripes in A's two colours. */
const stripes = "repeating-linear-gradient(-45deg, var(--lime) 0 22px, #0c0c0d 22px 44px)";

/** A strip of tape across the page, the words repeated along it. */
function Tape({ tilt, className = "" }: { tilt: string; className?: string }) {
	return (
		<div
			aria-hidden
			style={{ rotate: tilt }}
			className={`${mono} -mx-[10%] flex justify-center gap-8 overflow-hidden border-y-4 border-[#0c0c0d] bg-[var(--lime)] py-3 text-sm font-bold whitespace-nowrap uppercase tracking-[0.3em] text-[#0c0c0d] sm:text-base ${className}`}
		>
			{Array.from({ length: 8 }, (_, index) => (
				<span key={index}>Under construction ▲</span>
			))}
		</div>
	);
}

export default function Arcade() {
	return (
		<>
			<PageHead kicker="Arcade · closed for building" title="Arcade.">
				Playable interface experiments will live here.
			</PageHead>

			<section className="overflow-hidden pb-16">
				<div className="border-4 border-[#0c0c0d] p-3 dark:border-[var(--lime)]" style={{ background: stripes }}>
					<div className="relative overflow-hidden bg-[var(--bg)] px-6 py-16 sm:py-24">
						<Tape tilt="-4deg" className="absolute inset-x-0 top-8" />
						<div className="relative mx-auto max-w-xl py-16 text-center">
							<p className={`${label} text-[var(--accent-ink)]`}>Status · building</p>
							<h2 className="mt-4 text-[clamp(2.5rem,8vw,5rem)] leading-[0.92] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
								Under construction.
							</h2>
							<p className="mt-5 text-lg leading-relaxed text-[var(--dim)]">
								Nothing to play yet. Check back soon.
							</p>
						</div>
						<Tape tilt="3deg" className="absolute inset-x-0 bottom-8" />
					</div>
				</div>
			</section>
		</>
	);
}
