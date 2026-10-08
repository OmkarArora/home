import type { Metadata } from "next";

import { Reveal } from "@/components/lab/a/Reveal";
import { PageHead, PlaceholderTag, SectionHead, label, mono, riseAt } from "@/components/lab/a/ui";
import { identity, interests } from "@/content/profile";

export const metadata: Metadata = {
	title: "About — Omkar Arora",
	description: "Who Omkar Arora is when he isn't shipping: games, badminton, anime, heroes and films.",
};

export default function About() {
	return (
		<>
			<PageHead kicker={`About · ${identity.location}`} title="Off the clock." />

			<section style={riseAt(2)} className="rise grid gap-10 pb-12 md:grid-cols-12">
				<div className="space-y-5 text-xl leading-relaxed md:col-span-8">
					{identity.about.map((paragraph) => (
						<p key={paragraph}>{paragraph}</p>
					))}
					<PlaceholderTag />
				</div>
				<dl className={`${mono} self-start border border-[var(--ink)] text-xs md:col-span-4`}>
					<div className="border-b border-[var(--ink)] px-4 py-2 text-[11px] uppercase tracking-widest">Loadout</div>
					{identity.stack.map((tool) => (
						<div key={tool} className="border-b border-[var(--line)] px-4 py-2 uppercase last:border-b-0">
							{tool}
						</div>
					))}
				</dl>
			</section>

			<section className="py-12">
				<SectionHead title="AFK" tag="Interests" />
				<div className="mt-6 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-5">
					{interests.map((interest, index) => (
						<Reveal
							key={interest.key}
							index={index}
							className="bg-[var(--bg)] p-5 last:col-span-2 md:last:col-span-1"
						>
							<p className="text-3xl">{interest.emoji}</p>
							<h3 className="mt-4 font-bold">{interest.label}</h3>
							<p className="mt-1 text-sm leading-snug text-[var(--muted)]">{interest.line}</p>
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
