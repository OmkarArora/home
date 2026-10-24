import type { Metadata } from "next";
import Link from "next/link";

import { HoverList } from "@/components/site/afk/HoverList";
import { Scrapbook } from "@/components/site/afk/Scrapbook";
import { Toolkit } from "@/components/site/Toolkit";
import { PageHead, SectionHead, label, mono, riseAt } from "@/components/site/ui";
import { elsewhere } from "@/content/afk";
import { identity } from "@/content/profile";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/about", {
		title: "About — Omkar Arora",
		description: "Who Omkar Arora is when he isn't shipping: art, games, anime, travel, badminton, fitness, superheroes and films.",
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
				<div className="mt-6">
					<HoverList />
				</div>
				<p className={`${label} mt-12 mb-6`}>Sketchbook & snapshots</p>
				<Scrapbook />
				<ul className={`${mono} mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-wider`}>
					{elsewhere.map((page) => (
						<li key={page.href}>
							<a href={page.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-baseline gap-2">
								<span className="text-[var(--dim)]">{page.what}</span>
								<span className="font-bold underline decoration-[var(--lime)] decoration-2 underline-offset-4 group-hover:text-[var(--accent-ink)]">
									{page.handle} ↗
								</span>
							</a>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
