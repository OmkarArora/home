import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/site/Reveal";
import { Toolkit } from "@/components/site/Toolkit";
import { PageHead, SectionHead, label, mono, riseAt } from "@/components/site/ui";
import { identity, interests } from "@/content/profile";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/about", {
		title: "About — Omkar Arora",
		description: "Who Omkar Arora is when he isn't shipping: games, badminton, fitness, anime, heroes and films.",
	}),
};

export default function About() {
	return (
		<>
			<PageHead kicker={`About · ${identity.location}`} title="Off the clock." meaning={`About ${identity.name}`} />

			<section style={riseAt(2)} className="rise grid gap-10 pb-12 md:grid-cols-12">
				<div className="space-y-5 text-xl leading-relaxed md:col-span-8">
					{identity.about.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
					<Link
						href="/history"
						className={`${mono} block pt-2 text-xs font-bold uppercase tracking-wider hover:text-[var(--accent-ink)]`}
					>
						How this site got here: version history →
					</Link>
				</div>
			</section>

			<Toolkit />

			<section className="py-12">
				<SectionHead title="AFK" meaning="interests and hobbies" tag="Interests" />
				<div className="mt-6 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
					{interests.map((interest, index) => (
						<Reveal
							key={interest.key}
							index={index}
							className="bg-[var(--bg)] p-5 last:col-span-2 md:last:col-span-1"
						>
							<p className="text-3xl">{interest.emoji}</p>
							<h3 className="mt-4 font-bold">{interest.label}</h3>
							<p className="mt-1 text-sm leading-snug text-[var(--dim)]">{interest.line}</p>
							{interest.picks.map((pick) => (
								<p key={pick.name} className={`${label} mt-3`}>
									{pick.placeholder ? `[${pick.name}]` : pick.name}
								</p>
							))}
						</Reveal>
					))}
				</div>
			</section>
		</>
	);
}
