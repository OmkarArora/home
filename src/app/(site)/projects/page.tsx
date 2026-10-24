import type { Metadata } from "next";

import { JsonLd } from "@/components/json-ld";

import { Reveal } from "@/components/site/Reveal";
import { ReticleZone } from "@/components/site/Reticle";
import { PageHead, SectionHead, label, mono } from "@/components/site/ui";
import { projects } from "@/content/profile";
import { graph, ids, itemList, pageMetadata, person, webPage, website } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/projects", {
		title: "Projects — Omkar Arora",
		description: "Side projects by Omkar Arora: Game Night, real-time party games for a room of phones, plus a team résumé builder and this site.",
	}),
};

const button = `${mono} px-4 py-3 text-xs font-bold uppercase tracking-wider`;

export default function Projects() {
	const [featured, ...quests] = projects;

	return (
		<>
			<JsonLd
				json={graph(
					webPage("/projects", {
						name: "Projects",
						description: String(metadata.description),
						type: "CollectionPage",
						about: { "@id": ids.person },
						mainEntity: itemList(
							projects.map((project) => ({
								"@type": "SoftwareApplication",
								name: project.name,
								description: project.summary,
								applicationCategory: "WebApplication",
								...(project.href && { url: project.href }),
								...(project.repo && { codeRepository: project.repo }),
								author: { "@id": ids.person },
							})),
						),
					}),
					person(),
					website(),
				)}
			/>
			<PageHead kicker="Side quests · built for fun" title="Side quests." meaning="Projects by Omkar Arora">
				What I build when nobody asked: games, tools and this site.
			</PageHead>

			{featured && (
				<ReticleZone className="rise [--rise:3]">
					<article className="grid border border-[var(--ink)] md:grid-cols-12">
						<div className="p-6 md:col-span-8 md:p-8">
							<p className={`${label} text-[var(--accent-ink)]`}>★ Featured quest · {featured.year}</p>
							<h2 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{featured.name}</h2>
							<p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--dim)]">{featured.summary}</p>
							<p className={`${mono} mt-6 text-xs uppercase tracking-wider text-[var(--dim)]`}>
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
							<div className="flex flex-col justify-end border-t border-[var(--ink)] bg-[var(--lime)] p-6 text-[#0c0c0d] md:col-span-4 md:border-t-0 md:border-l md:p-8">
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
				<SectionHead title="Quest log" meaning="more projects" tag={`${quests.length} more`} />
				<ol>
					{quests.map((quest, index) => (
						<Reveal
							as="li"
							index={index}
							key={quest.name}
							className="grid gap-x-8 gap-y-2 border-b border-[var(--line)] py-6 md:grid-cols-[5rem_1fr_15rem_9rem] md:items-baseline"
						>
							<span className={`${mono} text-xs text-[var(--dim)]`}>{quest.year}</span>
							<div>
								<h3 className="text-xl font-bold tracking-tight">{quest.name}</h3>
								<p className="mt-1 leading-relaxed text-[var(--dim)]">{quest.summary}</p>
							</div>
							{/* Wraps only between whole tags, never after a stray dot. */}
							<ul className={`${label} flex flex-wrap gap-x-2 gap-y-1`}>
								{quest.stack.slice(0, 3).map((tool, i, all) => (
									<li key={tool} className="whitespace-nowrap">
										{tool}
										{i < all.length - 1 && " ·"}
									</li>
								))}
							</ul>
							<div className={`${mono} flex gap-4 text-xs font-bold uppercase tracking-wider md:justify-end`}>
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
