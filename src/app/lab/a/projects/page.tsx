import type { Metadata } from "next";

import { Reveal } from "@/components/lab/a/Reveal";
import { ReticleZone } from "@/components/lab/a/Reticle";
import { PageHead, SectionHead, label, mono } from "@/components/lab/a/ui";
import { projects } from "@/content/profile";

export const metadata: Metadata = {
	title: "Side quests — Omkar Arora",
	description: "Things Omkar Arora built for fun, starting with Game Night.",
};

const button = `${mono} px-4 py-3 text-xs font-bold uppercase tracking-wider`;

export default function Projects() {
	const [featured, ...quests] = projects;

	return (
		<>
			<PageHead kicker="Side quests · built for fun" title="Side quests.">
				What I build when nobody asked: games, tools and this site.
			</PageHead>

			{featured && (
				<ReticleZone className="rise [--rise:3]">
					<article className="grid border border-[var(--ink)] md:grid-cols-12">
						<div className="p-6 md:col-span-8 md:p-8">
							<p className={`${label} text-[var(--accent-ink)]`}>★ Featured quest · {featured.year}</p>
							<h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{featured.name}</h2>
							<p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{featured.summary}</p>
							<p className={`${mono} mt-6 text-xs uppercase tracking-wider text-[var(--muted)]`}>
								{featured.stack.join(" · ")}
							</p>
							<div className="mt-8 flex flex-wrap gap-3">
								{featured.href && (
									<a
										href={featured.href}
										target="_blank"
										rel="noopener noreferrer"
										className={`${button} bg-[var(--ink)] text-[var(--bg)]`}
									>
										Play it ↗
									</a>
								)}
								{featured.caseStudy && (
									<a
										href={featured.caseStudy.href}
										target="_blank"
										rel="noopener noreferrer"
										className={`${button} border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)]`}
									>
										{featured.caseStudy.label} ↗
									</a>
								)}
							</div>
						</div>
						{featured.highlight && (
							<div className="flex flex-col justify-end border-t border-[var(--ink)] bg-[var(--accent)] p-6 text-[#0c0c0d] md:col-span-4 md:border-t-0 md:border-l md:p-8">
								<p className="text-[clamp(4rem,10vw,7rem)] leading-none font-extrabold tracking-tighter">
									{featured.highlight.value}
								</p>
								<p className={`${mono} mt-2 text-xs font-bold uppercase tracking-widest`}>
									{featured.highlight.label}
								</p>
							</div>
						)}
					</article>
				</ReticleZone>
			)}

			<section className="py-16">
				<SectionHead title="Quest log" tag={`${quests.length} more`} />
				<ol>
					{quests.map((quest, index) => (
						<Reveal
							as="li"
							index={index}
							key={quest.name}
							className="grid gap-x-8 gap-y-2 border-b border-[var(--line)] py-6 md:grid-cols-[5rem_1fr_14rem_auto] md:items-baseline"
						>
							<span className={`${mono} text-xs text-[var(--muted)]`}>{quest.year}</span>
							<div>
								<h3 className="text-xl font-bold tracking-tight">{quest.name}</h3>
								<p className="mt-1 leading-relaxed text-[var(--muted)]">{quest.summary}</p>
							</div>
							<p className={label}>{quest.stack.slice(0, 3).join(" · ")}</p>
							<div className={`${mono} flex gap-4 text-xs font-bold uppercase tracking-wider`}>
								{quest.href && (
									<a href={quest.href} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-ink)]">
										Site ↗
									</a>
								)}
								{quest.repo && (
									<a href={quest.repo} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-ink)]">
										Code ↗
									</a>
								)}
							</div>
						</Reveal>
					))}
				</ol>
			</section>
		</>
	);
}
