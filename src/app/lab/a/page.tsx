import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { latestPosts, shortDate } from "@/components/lab/data";
import {
	identity,
	interests,
	projects,
	roles,
	shipped,
	yearsOfExperience,
} from "@/content/profile";

/** Version A — Patch notes. A player profile, with work as release notes. */

const mono = "[font-family:var(--lab-mono)]";
const label = `${mono} text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]`;

function SectionHead({ tag, title }: { tag: string; title: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-[var(--ink)] pb-3">
			<h2 className={`${mono} text-sm font-bold uppercase tracking-[0.14em]`}>
				<span className="text-[var(--accent-ink)]">//</span> {title}
			</h2>
			<span className={label}>{tag}</span>
		</div>
	);
}

function PlaceholderTag() {
	return (
		<span
			className={`${mono} border border-dashed border-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]`}
		>
			placeholder
		</span>
	);
}

export default async function PatchNotes() {
	const posts = await latestPosts(3);
	const years = yearsOfExperience();
	const [featured, ...quests] = projects;

	return (
		<div className="mx-auto max-w-6xl px-5 sm:px-8">
			{/* ─── Top bar ─── */}
			<header
				className={`${mono} flex items-center justify-between gap-4 border-b border-[var(--line)] py-4 text-xs`}
			>
				<Link href="/lab" className="font-bold tracking-wider">
					OMKAR<span className="text-[var(--accent-ink)]">.EXE</span>
				</Link>
				<nav className="hidden items-center gap-6 uppercase tracking-wider text-[var(--muted)] md:flex">
					<a href="#patch-notes" className="hover:text-[var(--ink)]">
						Patch notes
					</a>
					<a href="#quests" className="hover:text-[var(--ink)]">
						Side quests
					</a>
					<a href="#log" className="hover:text-[var(--ink)]">
						Dev log
					</a>
					<a href="#contact" className="hover:text-[var(--ink)]">
						Contact
					</a>
				</nav>
				<div className="flex items-center gap-3">
					<span className="hidden items-center gap-1.5 text-[var(--muted)] sm:flex">
						<span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
						ONLINE
					</span>
					<ModeToggle />
				</div>
			</header>

			{/* ─── Hero: headline + player card ─── */}
			<section className="grid gap-10 py-14 md:grid-cols-12 md:py-24">
				<div className="md:col-span-7">
					<p className={label}>Player 01 · Build {new Date().getFullYear()}</p>
					<h1 className="mt-6 text-[clamp(3rem,9vw,6.75rem)] leading-[0.92] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
						Ships{" "}
						<span className="relative inline-block">
							<span className="absolute inset-x-[-0.08em] bottom-[0.08em] top-[0.18em] -z-0 -skew-x-6 bg-[var(--accent)]" />
							<span className="relative text-[#0c0c0d]">fast</span>
						</span>
						<br />
						interfaces.
					</h1>
					<p className="mt-8 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
						{identity.pitch}
					</p>
					<div className={`${mono} mt-10 flex flex-wrap gap-3 text-xs uppercase tracking-wider`}>
						<a
							href={identity.links.resume}
							className="bg-[var(--ink)] px-4 py-3 font-bold text-[var(--bg)] transition-transform hover:-translate-y-0.5"
						>
							▶ Resume
						</a>
						<a
							href={`mailto:${identity.email}`}
							className="border border-[var(--ink)] px-4 py-3 font-bold transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
						>
							Say hi
						</a>
					</div>
				</div>

				<aside className="self-end md:col-span-5">
					<div className="border border-[var(--ink)] bg-[var(--card)]">
						<div className={`${mono} flex items-center justify-between border-b border-[var(--ink)] px-4 py-2 text-[11px] uppercase tracking-widest`}>
							<span>Player card</span>
							<span className="font-bold text-[var(--accent-ink)]">LV.{years}</span>
						</div>
						<div className="flex gap-4 p-4">
							<Image
								src="/images/profile.jpg"
								alt={identity.name}
								width={112}
								height={112}
								className="size-24 shrink-0 object-cover grayscale contrast-125 sm:size-28"
								priority
							/>
							<div className="min-w-0">
								<p className="text-2xl leading-tight font-bold tracking-tight">{identity.name}</p>
								<p className="mt-1 text-sm text-[var(--muted)]">{identity.title}</p>
							</div>
						</div>
						<dl className={`${mono} border-t border-[var(--line)] text-xs`}>
							{[
								["Class", "Frontend"],
								["Guild", identity.company],
								["Spawn", identity.location],
								["Main", identity.stack.slice(0, 3).join(" / ")],
								["XP", `${years}+ yrs`],
							].map(([k, v]) => (
								<div
									key={k}
									className="flex justify-between gap-4 border-b border-[var(--line)] px-4 py-2 last:border-b-0"
								>
									<dt className="uppercase tracking-widest text-[var(--muted)]">{k}</dt>
									<dd className="truncate text-right font-medium uppercase">{v}</dd>
								</div>
							))}
						</dl>
					</div>
				</aside>
			</section>

			{/* ─── Patch notes: shipped at ixigo ─── */}
			<section id="patch-notes" className="py-12">
				<SectionHead title="Patch notes" tag={`Shipped at ${identity.company}`} />
				<ol>
					{shipped.map((feature, index) => {
						const version = `v${shipped.length - index}.0`;
						return (
							<li
								key={feature.name}
								className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 border-b border-[var(--line)] py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
							>
								<span className={`${mono} text-sm font-bold text-[var(--accent-ink)]`}>{version}</span>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="text-xl font-bold tracking-tight sm:text-2xl">{feature.name}</h3>
										{feature.placeholder && <PlaceholderTag />}
									</div>
									<p className="mt-1 text-[var(--muted)]">{feature.summary}</p>
									<p className={`${label} mt-2`}>
										{feature.role} · {feature.shipped}
									</p>
								</div>
								{feature.impact && (
									<div className="col-start-2 sm:col-start-3 sm:text-right">
										<p className={`${mono} text-3xl font-bold tracking-tight`}>{feature.impact.value}</p>
										<p className={label}>{feature.impact.label}</p>
									</div>
								)}
							</li>
						);
					})}
				</ol>
			</section>

			{/* ─── Side quests ─── */}
			<section id="quests" className="py-12">
				<SectionHead title="Side quests" tag="Built for fun" />

				{featured && (
					<article className="mt-8 grid border border-[var(--ink)] md:grid-cols-12">
						<div className="p-6 md:col-span-8 md:p-8">
							<p className={`${label} text-[var(--accent-ink)]`}>★ Featured quest · {featured.year}</p>
							<h3 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{featured.name}</h3>
							<p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{featured.summary}</p>
							<p className={`${mono} mt-6 text-xs uppercase tracking-wider text-[var(--muted)]`}>
								{featured.stack.join(" · ")}
							</p>
							<div className={`${mono} mt-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider`}>
								{featured.href && (
									<a href={featured.href} target="_blank" rel="noopener noreferrer" className="bg-[var(--ink)] px-4 py-3 text-[var(--bg)]">
										Play it ↗
									</a>
								)}
								{featured.caseStudy && (
									<a href={featured.caseStudy.href} target="_blank" rel="noopener noreferrer" className="border border-[var(--ink)] px-4 py-3 hover:bg-[var(--ink)] hover:text-[var(--bg)]">
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
								<p className={`${mono} mt-2 text-xs font-bold uppercase tracking-widest`}>{featured.highlight.label}</p>
							</div>
						)}
					</article>
				)}

				<div className="mt-4 grid gap-4 md:grid-cols-3">
					{quests.map((quest) => (
						<a
							key={quest.name}
							href={quest.href ?? quest.repo}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex flex-col border border-[var(--line)] p-5 transition-colors hover:border-[var(--ink)]"
						>
							<div className="flex items-start justify-between gap-2">
								<h3 className="text-xl font-bold tracking-tight">{quest.name}</h3>
								<ArrowUpRight className="size-4 shrink-0 text-[var(--muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
							</div>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{quest.summary}</p>
							<p className={`${label} mt-4`}>{quest.stack.slice(0, 3).join(" · ")}</p>
						</a>
					))}
				</div>
			</section>

			{/* ─── Save history + dev log ─── */}
			<section className="grid gap-12 py-12 md:grid-cols-2">
				<div>
					<SectionHead title="Save history" tag="Career" />
					<ol>
						{roles.map((role) => (
							<li key={role.company} className="border-b border-[var(--line)] py-5">
								<div className="flex items-baseline justify-between gap-4">
									<h3 className="text-lg font-bold">{role.company}</h3>
									<span className={`${mono} text-xs text-[var(--muted)]`}>
										{role.from}–{role.to}
									</span>
								</div>
								<p className={`${label} mt-1`}>{role.title}</p>
								<p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{role.summary}</p>
							</li>
						))}
					</ol>
				</div>

				<div id="log">
					<SectionHead title="Dev log" tag="Writing" />
					<ol>
						{posts.map((post) => (
							<li key={post.slug} className="border-b border-[var(--line)]">
								<Link href={`/blog/${post.slug}`} className="group block py-5">
									<p className={`${mono} text-xs text-[var(--muted)]`}>{shortDate(post.publishedAt)}</p>
									<h3 className="mt-1 text-lg leading-snug font-bold group-hover:underline group-hover:decoration-[var(--accent)] group-hover:decoration-4 group-hover:underline-offset-4">
										{post.title}
									</h3>
								</Link>
							</li>
						))}
					</ol>
					<Link href="/blog" className={`${mono} mt-4 inline-block text-xs font-bold uppercase tracking-wider`}>
						All entries →
					</Link>
				</div>
			</section>

			{/* ─── Off the clock ─── */}
			<section className="py-12">
				<SectionHead title="Off the clock" tag="AFK" />
				<div className="mt-6 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-5">
					{interests.map((interest) => (
						<div key={interest.key} className="bg-[var(--bg)] p-5 last:col-span-2 md:last:col-span-1">
							<p className="text-3xl">{interest.emoji}</p>
							<h3 className="mt-4 font-bold">{interest.label}</h3>
							<p className="mt-1 text-sm leading-snug text-[var(--muted)]">{interest.line}</p>
							{interest.picks.map((pick) => (
								<p key={pick.name} className={`${label} mt-3`}>
									{pick.placeholder ? `[${pick.name}]` : pick.name}
								</p>
							))}
						</div>
					))}
				</div>
			</section>

			{/* ─── Contact ─── */}
			<footer id="contact" className="mt-12 border-t border-[var(--ink)] py-16">
				<p className={label}>Continue?</p>
				<a
					href={`mailto:${identity.email}`}
					className="mt-4 block text-[clamp(1.75rem,6vw,4.5rem)] leading-none font-extrabold tracking-tight break-all hover:text-[var(--accent-ink)]"
				>
					{identity.email}
				</a>
				<div className={`${mono} mt-10 flex flex-wrap justify-between gap-4 text-xs uppercase tracking-wider text-[var(--muted)]`}>
					<div className="flex gap-6">
						<a href={identity.links.github} className="hover:text-[var(--ink)]">GitHub</a>
						<a href={identity.links.linkedin} className="hover:text-[var(--ink)]">LinkedIn</a>
						<a href={identity.links.resume} className="hover:text-[var(--ink)]">Resume</a>
					</div>
					<span>© {new Date().getFullYear()} · Press start</span>
				</div>
			</footer>
		</div>
	);
}
