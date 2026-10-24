import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";

import { Polaroids } from "@/components/site/Polaroids";
import { Reveal } from "@/components/site/Reveal";
import { RotatingWord } from "@/components/site/RotatingWord";
import { Toolkit } from "@/components/site/Toolkit";
import { HeroActions } from "@/components/site/HeroActions";
import { PlaceholderTag, SectionHead, label, mono, riseAt } from "@/components/site/ui";
import { allPosts } from "@/components/site/data";
import { productLabel, shipped } from "@/content/ixigo";
import { identity, projects, roles, yearsOfExperience } from "@/content/profile";
import { graph, pageMetadata, person, website } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/", {
		title: `${identity.name} — ${identity.title}`,
		description: `${identity.name} is a ${identity.title.toLowerCase()} at ${identity.company}, building fast, careful interfaces for flights and cabs on the web. ${yearsOfExperience()}+ years, from Sparklin to ixigo.`,
	}),
};

/** His Instagram posts, for the art and photos in the polaroid stack. */
const instagram = {
	goku: "https://www.instagram.com/p/Dd_YAZ3Cjir/",
	asta: "https://www.instagram.com/p/Ddehb0NvvOB/",
	tokyo: "https://www.instagram.com/p/DVBEx_8ESHa3v4I3TBbGSrBN6xAGJKwhJ1cxDY0/",
};

/** What the headline says the web feels like, the first one most of all. */
const feels = ["magical", "instant", "effortless", "solid", "alive"];

/**
 * The home page ("Patch notes", v3). It only answers "who is this, and what
 * has he shipped": the rest has a page of its own.
 */
export default async function PatchNotes() {
	const posts = await allPosts();
	const [latest] = posts;
	const years = yearsOfExperience();
	const [featured] = projects;
	const highlights = shipped.filter((item) => item.feature);

	return (
		<>
			<JsonLd json={graph(person(), website())} />
			{/* ─── Hero: headline + player card ─── */}
			<section className="grid gap-10 py-14 md:grid-cols-12 md:py-24">
				<div className="md:col-span-7">
					<p className={`${label} rise`} style={riseAt(0)}>
						{identity.title} · {identity.company}
					</p>
					<h1
						aria-label={`Web that feels ${feels[0]}: ${identity.name}, ${identity.title} at ${identity.company}`}
						style={riseAt(1)}
						className="rise mt-6 text-[clamp(3rem,9vw,6.75rem)] leading-[0.92] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
						Web that feels{" "}
						<br />
						<RotatingWord words={feels} />
						{/* Whose site this is, for search engines; the label above says it for screen readers. */}
						<span className="sr-only">
							: {identity.name}, {identity.title} at {identity.company}
						</span>
					</h1>
					<p style={riseAt(2)} className="rise mt-8 max-w-lg text-lg leading-relaxed text-[var(--dim)]">{identity.pitch}</p>
					<div style={riseAt(3)} className="rise mt-10">
						<HeroActions resume={identity.links.resume} />
					</div>
				</div>

				<aside className="rise order-first min-w-0 self-end [--rise:0] md:order-none md:col-span-5 md:[--rise:4]">
					<Polaroids
						snaps={[
							...(latest ? [{ kind: "post" as const, title: latest.title, meta: `${latest.minutes} min read`, caption: "Latest post", href: `/blog/${latest.slug}` }] : []),
							{ kind: "art", src: "/images/display-art/kid-goku.jpeg", alt: "Drawing of Kid Goku in a fighting stance", caption: "Kid Goku", href: instagram.goku, contain: true },
							{ kind: "photo", src: "/images/display-pics/tokyo-tower.jpeg", alt: "Tokyo Tower through snowy trees", caption: "Tokyo Tower", href: instagram.tokyo },
							...(highlights[0] ? [{ kind: "work" as const, title: highlights[0].title, meta: `${identity.company} · ${highlights[0].when}`, caption: "Latest work", href: "/work" }] : []),
							{ kind: "art", src: "/images/display-art/asta-demon.jpeg", alt: "Painting of Asta raising his demon sword against a red sky", caption: "Asta", href: instagram.asta },
							{ kind: "photo", src: "/images/display-pics/black-cat.jpeg", alt: "A black cat sitting on moss", caption: "A garden cat", href: instagram.tokyo },
							{ kind: "photo", src: "/images/display-pics/tokyo-castle.jpeg", alt: "A Japanese castle tower under snow", caption: "Tokyo in snow", href: instagram.tokyo },
						]}
					/>
				</aside>
			</section>

			{/* ─── Patch notes: the biggest things shipped at ixigo ─── */}
			<section id="patch-notes" className="py-12">
				<SectionHead title="Patch notes" meaning={`features shipped at ${identity.company}`} tag={`Shipped at ${identity.company}`} />
				<ol>
					{highlights.map((feature, index) => (
						<Reveal
							as="li"
							index={index}
							key={feature.title}
							className="grid gap-x-8 gap-y-2 border-b border-[var(--line)] py-6 md:grid-cols-[7rem_1fr]"
						>
							<span className={`${mono} text-sm font-bold text-[var(--accent-ink)] md:pt-1.5`}>
								{feature.when}
							</span>
							<div className="min-w-0">
								<h3 className="text-xl font-bold tracking-tight sm:text-2xl">{feature.title}</h3>
								<p className="mt-2 max-w-3xl leading-relaxed text-[var(--dim)]">{feature.summary}</p>
								<p className={`${label} mt-3`}>
									{productLabel[feature.product]} · {feature.skills.join(" · ")}
								</p>
							</div>
						</Reveal>
					))}
				</ol>
				<Link
					href="/work"
					className={`${mono} mt-6 inline-block text-xs font-bold uppercase tracking-wider hover:text-[var(--accent-ink)]`}
				>
					Everything shipped, at ixigo and Sparklin →
				</Link>
			</section>

			{/* ─── Save history ─── */}
			<section className="py-12">
				<SectionHead title="Save history" meaning="work experience" tag={`${years}+ years`} />
				<ol>
					{roles.map((role, index) => (
						<Reveal
							as="li"
							index={index}
							key={role.company}
							className="grid gap-x-8 gap-y-1 border-b border-[var(--line)] py-6 md:grid-cols-[7rem_19rem_1fr]"
						>
							<span className={`${mono} text-xs text-[var(--dim)] md:pt-1.5`}>
								{role.from}–{role.to}
							</span>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-xl font-bold tracking-tight">{role.company}</h3>
									{role.placeholder && <PlaceholderTag />}
								</div>
								<p className={`${label} mt-1`}>{role.title}</p>
							</div>
							<p className="mt-2 leading-relaxed text-[var(--dim)] md:mt-0 md:pt-1">{role.summary}</p>
						</Reveal>
					))}
				</ol>
			</section>

			{/* ─── Loadout: the tools ─── */}
			<Toolkit />

			{/* ─── Elsewhere on the site ─── */}
			<Reveal as="section" className="grid gap-4 py-12 md:grid-cols-2">
				{featured && (
					<Link
						href="/projects"
						className="border border-[var(--ink)] p-6 transition-colors hover:bg-[var(--lime)] hover:text-[#0c0c0d]"
					>
						<p className={`${mono} text-xs uppercase tracking-[0.18em] opacity-70`}>Side quests</p>
						<p className="mt-3 text-2xl font-bold tracking-tight">
							{featured.name} and {projects.length - 1} more →
						</p>
					</Link>
				)}
				{latest && (
					<Link
						href="/blog"
						className="border border-[var(--ink)] p-6 transition-colors hover:bg-[var(--lime)] hover:text-[#0c0c0d]"
					>
						<p className={`${mono} text-xs uppercase tracking-[0.18em] opacity-70`}>Latest in the dev log</p>
						<p className="mt-3 text-2xl font-bold tracking-tight">{latest.title} →</p>
					</Link>
				)}
			</Reveal>
		</>
	);
}
