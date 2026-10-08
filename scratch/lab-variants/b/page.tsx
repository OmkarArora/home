import Image from "next/image";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { LocalTime } from "@/components/lab/LocalTime";
import { latestPosts, shortDate } from "@/components/lab/data";
import {
	identity,
	interests,
	projects,
	roles,
	shipped,
	yearsOfExperience,
} from "@/content/profile";

/** Version B — Editorial. Serif-led, numbered sections, one vermilion. */

const mono = "[font-family:var(--lab-mono)]";
const grotesk = "[font-family:var(--lab-grotesk)]";
const label = `${mono} text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]`;

function Section({
	number,
	title,
	aside,
	id,
	children,
}: {
	number: string;
	title: string;
	aside?: string;
	id?: string;
	children: React.ReactNode;
}) {
	return (
		<section id={id} className="grid gap-6 border-t border-[var(--ink)] py-12 md:grid-cols-12 md:py-16">
			<header className="md:col-span-3">
				<p className={`${grotesk} text-5xl leading-none font-black tracking-tight text-[var(--accent)] [font-stretch:75%]`}>
					{number}
				</p>
				<h2 className="mt-3 text-3xl leading-tight">{title}</h2>
				{aside && <p className={`${label} mt-2`}>{aside}</p>}
			</header>
			<div className="md:col-span-9">{children}</div>
		</section>
	);
}

function Placeholder() {
	return (
		<span className={`${mono} ml-2 align-middle text-[10px] uppercase tracking-widest text-[var(--accent)]`}>
			[placeholder]
		</span>
	);
}

export default async function Editorial() {
	const posts = await latestPosts(3);
	const years = yearsOfExperience();
	const [lead, ...others] = projects;

	return (
		<div className="mx-auto max-w-6xl px-5 sm:px-8">
			{/* ─── Masthead ─── */}
			<header className="flex items-center justify-between gap-4 border-b-[3px] border-[var(--ink)] py-5">
				<Link href="/lab" className={`${grotesk} text-sm font-extrabold uppercase tracking-[0.08em]`}>
					Omkar Arora
				</Link>
				<p className={`${label} hidden md:block`}>Frontend engineer · Selected work</p>
				<div className="flex items-center gap-4">
					<LocalTime className={`${label} hidden sm:inline`} />
					<ModeToggle />
				</div>
			</header>
			<div className="h-px bg-[var(--ink)] opacity-40 mt-[3px]" />

			{/* ─── Opening ─── */}
			<section className="grid gap-10 py-12 md:grid-cols-12 md:py-20">
				<aside className="order-2 md:order-1 md:col-span-3">
					<dl className="grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-1">
						{[
							["Based in", identity.location],
							["Currently", `SDE 2 at ${identity.company}`],
							["Experience", `${years}+ years`],
							["Works in", identity.stack.slice(0, 3).join(", ")],
						].map(([k, v]) => (
							<div key={k}>
								<dt className={label}>{k}</dt>
								<dd className={`${mono} mt-1 text-sm`}>{v}</dd>
							</div>
						))}
					</dl>
					<figure className="mt-8 hidden md:block">
						<Image
							src="/images/profile.jpg"
							alt={identity.name}
							width={240}
							height={240}
							className="aspect-square w-full object-cover grayscale"
							priority
						/>
						<figcaption className={`${label} mt-2 normal-case tracking-normal italic [font-family:var(--lab-serif)] text-sm`}>
							Fig. 1 — The author.
						</figcaption>
					</figure>
				</aside>

				<div className="order-1 md:order-2 md:col-span-9">
					<h1 className="text-[clamp(2.75rem,7.2vw,6.25rem)] leading-[0.98] tracking-[-0.02em]">
						Interfaces that <em className="text-[var(--accent)]">feel instant</em>, and
						the plumbing that keeps them that way.
					</h1>
					<p className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--muted)] sm:text-2xl">
						I’m {identity.firstName}, a {identity.title.toLowerCase()} at{" "}
						{identity.company}. {identity.pitch}
					</p>
					<div className={`${mono} mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm`}>
						<a href={identity.links.resume} className="border-b border-[var(--ink)] pb-0.5 hover:text-[var(--accent)] hover:border-[var(--accent)]">
							Résumé →
						</a>
						<a href={`mailto:${identity.email}`} className="border-b border-[var(--ink)] pb-0.5 hover:text-[var(--accent)] hover:border-[var(--accent)]">
							Email →
						</a>
						<a href={identity.links.github} className="border-b border-[var(--ink)] pb-0.5 hover:text-[var(--accent)] hover:border-[var(--accent)]">
							GitHub →
						</a>
					</div>
				</div>
			</section>

			{/* ─── 01 Shipped ─── */}
			<Section number="01" title={`Shipped at ${identity.company}`} aside="Live, in production">
				<div className={`${label} hidden grid-cols-[3rem_1fr_9rem_7rem_4rem] gap-4 border-b border-[var(--line)] pb-2 sm:grid`}>
					<span>No.</span>
					<span>Feature</span>
					<span>Role</span>
					<span className="text-right">Impact</span>
					<span className="text-right">Year</span>
				</div>
				<ol>
					{shipped.map((feature, index) => (
						<li
							key={feature.name}
							className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-1 border-b border-[var(--line)] py-5 sm:grid-cols-[3rem_1fr_9rem_7rem_4rem] sm:items-baseline"
						>
							<span className={`${mono} text-sm text-[var(--muted)]`}>{String(index + 1).padStart(2, "0")}</span>
							<div>
								<h3 className="text-2xl leading-tight">
									{feature.name}
									{feature.placeholder && <Placeholder />}
								</h3>
								<p className="mt-1 text-base text-[var(--muted)]">{feature.summary}</p>
							</div>
							<span className={`${mono} col-start-2 text-xs sm:col-start-auto`}>{feature.role}</span>
							<span className={`${grotesk} col-start-2 text-2xl font-bold sm:col-start-auto sm:text-right`}>
								{feature.impact?.value ?? "—"}
							</span>
							<span className={`${mono} col-start-2 text-xs text-[var(--muted)] sm:col-start-auto sm:text-right`}>
								{feature.shipped}
							</span>
						</li>
					))}
				</ol>
			</Section>

			{/* ─── 02 Projects ─── */}
			<Section number="02" title="Projects" aside="Made on my own time">
				{lead && (
					<article className="grid gap-8 border-b border-[var(--line)] pb-10 lg:grid-cols-[1fr_auto]">
						<div>
							<p className={label}>Lead story · {lead.year}</p>
							<h3 className="mt-2 text-5xl leading-none sm:text-6xl">{lead.name}</h3>
							<p className="mt-5 max-w-xl text-xl leading-relaxed text-[var(--muted)]">{lead.summary}</p>
							<p className={`${label} mt-5`}>{lead.stack.join(" · ")}</p>
							<div className={`${mono} mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm`}>
								{lead.href && (
									<a href={lead.href} target="_blank" rel="noopener noreferrer" className="border-b border-[var(--ink)] pb-0.5 hover:text-[var(--accent)] hover:border-[var(--accent)]">
										Play it ↗
									</a>
								)}
								{lead.caseStudy && (
									<a href={lead.caseStudy.href} target="_blank" rel="noopener noreferrer" className="border-b border-[var(--ink)] pb-0.5 hover:text-[var(--accent)] hover:border-[var(--accent)]">
										Read: {lead.caseStudy.label} ↗
									</a>
								)}
							</div>
						</div>
						{lead.highlight && (
							<div className="lg:text-right">
								<p className={`${grotesk} text-[clamp(5rem,13vw,9.5rem)] leading-[0.85] font-black tracking-tight text-[var(--accent)] [font-stretch:75%]`}>
									{lead.highlight.value}
								</p>
								<p className="mt-2 text-lg italic text-[var(--muted)]">{lead.highlight.label}</p>
							</div>
						)}
					</article>
				)}
				<div className="grid gap-8 pt-8 sm:grid-cols-3">
					{others.map((project) => (
						<a
							key={project.name}
							href={project.href ?? project.repo}
							target="_blank"
							rel="noopener noreferrer"
							className="group block border-t border-[var(--ink)] pt-4"
						>
							<h3 className="text-2xl leading-tight group-hover:text-[var(--accent)]">{project.name}</h3>
							<p className="mt-2 text-base leading-snug text-[var(--muted)]">{project.summary}</p>
							<p className={`${label} mt-3`}>{project.stack.slice(0, 3).join(" · ")}</p>
						</a>
					))}
				</div>
			</Section>

			{/* ─── 03 Writing ─── */}
			<Section number="03" title="Writing" aside="From the blog">
				<ol>
					{posts.map((post) => (
						<li key={post.slug} className="border-b border-[var(--line)] first:border-t">
							<Link href={`/blog/${post.slug}`} className="group grid gap-1 py-5 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-6">
								<span className={`${mono} text-xs text-[var(--muted)]`}>{shortDate(post.publishedAt)}</span>
								<span className="text-2xl leading-tight group-hover:text-[var(--accent)]">{post.title}</span>
								<span className="hidden text-xl text-[var(--muted)] transition-transform group-hover:translate-x-1 sm:inline">→</span>
							</Link>
						</li>
					))}
				</ol>
				<Link href="/blog" className={`${mono} mt-6 inline-block text-sm border-b border-[var(--ink)] pb-0.5`}>
					Every post →
				</Link>
			</Section>

			{/* ─── 04 Career ─── */}
			<Section number="04" title="Career">
				<ol>
					{roles.map((role) => (
						<li key={role.company} className="grid gap-1 border-b border-[var(--line)] py-5 first:border-t sm:grid-cols-[8rem_1fr] sm:gap-6">
							<span className={`${mono} text-xs text-[var(--muted)]`}>
								{role.from} — {role.to}
							</span>
							<div>
								<h3 className="text-2xl leading-tight">
									{role.company} <span className="italic text-[var(--muted)]">— {role.title}</span>
								</h3>
								<p className="mt-1 text-base text-[var(--muted)]">{role.summary}</p>
							</div>
						</li>
					))}
				</ol>
			</Section>

			{/* ─── 05 Off the clock ─── */}
			<Section number="05" title="Off the clock">
				<p className="text-3xl leading-snug sm:text-4xl">
					Away from the keyboard:{" "}
					{interests.map((interest, index) => (
						<span key={interest.key}>
							<em className="text-[var(--accent)]">{interest.label.toLowerCase()}</em>
							{index < interests.length - 2 ? ", " : index === interests.length - 2 ? " and " : "."}
						</span>
					))}
				</p>
				<div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
					{interests.map((interest) => (
						<div key={interest.key} className="border-t border-[var(--line)] pt-3">
							<p className={label}>{interest.label}</p>
							<p className="mt-2 text-base leading-snug text-[var(--muted)]">{interest.line}</p>
							{interest.picks.map((pick) => (
								<p key={pick.name} className={`${mono} mt-2 text-xs`}>
									{pick.placeholder ? <span className="text-[var(--accent)]">[{pick.name}]</span> : pick.name}
								</p>
							))}
						</div>
					))}
				</div>
			</Section>

			{/* ─── Colophon ─── */}
			<footer id="contact" className="border-t-[3px] border-[var(--ink)] py-16">
				<a href={`mailto:${identity.email}`} className="group block">
					<p className="text-[clamp(3.5rem,12vw,9rem)] leading-none italic group-hover:text-[var(--accent)]">
						Say hello.
					</p>
					<p className={`${mono} mt-4 text-sm text-[var(--muted)] break-all`}>{identity.email}</p>
				</a>
				<div className={`${label} mt-14 flex flex-wrap justify-between gap-4`}>
					<div className="flex gap-6">
						<a href={identity.links.github} className="hover:text-[var(--ink)]">GitHub</a>
						<a href={identity.links.linkedin} className="hover:text-[var(--ink)]">LinkedIn</a>
						<a href={identity.links.resume} className="hover:text-[var(--ink)]">Résumé</a>
					</div>
					<span>Set in Instrument Serif, Archivo &amp; IBM Plex Mono</span>
				</div>
			</footer>
		</div>
	);
}
