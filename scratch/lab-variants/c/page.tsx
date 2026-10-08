import Image from "next/image";
import Link from "next/link";

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

/** Version C — Panels. A comic page: ink borders, one red, screentone. */

const display = "[font-family:var(--lab-display)] uppercase";
const mono = "[font-family:var(--lab-mono)]";
const caption = `${mono} text-[11px] uppercase tracking-[0.12em]`;

function Panel({
	className = "",
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={`relative overflow-hidden border-[3px] border-[var(--ink)] bg-[var(--panel)] ${className}`}>
			{children}
		</div>
	);
}

/** The rectangular narration box comics put in a panel's corner. */
function Narration({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return (
		<span className={`${caption} inline-block w-fit self-start border-2 border-[var(--ink)] bg-[var(--panel)] px-2 py-1 font-bold ${className}`}>
			{children}
		</span>
	);
}

function PlaceholderMark() {
	return <span className={`${caption} text-[var(--accent)]`}>[placeholder]</span>;
}

export default async function Panels() {
	const posts = await latestPosts(3);
	const years = yearsOfExperience();
	const [featured, ...others] = projects;

	return (
		<div className="mx-auto max-w-6xl px-3 pb-10 sm:px-6">
			{/* ─── Title strip ─── */}
			<header className="flex items-center justify-between gap-4 py-5">
				<Link href="/lab" className={`${display} text-2xl tracking-wide`}>
					Omkar<span className="text-[var(--accent)]">.</span>
				</Link>
				<nav className={`${caption} hidden gap-6 font-bold md:flex`}>
					<a href="#shipped" className="hover:text-[var(--accent)]">Shipped</a>
					<a href="#projects" className="hover:text-[var(--accent)]">Projects</a>
					<a href="#off" className="hover:text-[var(--accent)]">Off the clock</a>
					<a href="#contact" className="hover:text-[var(--accent)]">Contact</a>
				</nav>
				<ModeToggle />
			</header>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-12">
				{/* ─── Splash ─── */}
				<Panel className="min-h-[26rem] p-6 md:col-span-8 md:p-10">
					<div
						className="tone pointer-events-none absolute inset-0"
						style={{ maskImage: "linear-gradient(135deg, transparent 45%, black 100%)", WebkitMaskImage: "linear-gradient(135deg, transparent 45%, black 100%)" }}
					/>
					<div className="relative flex h-full flex-col">
						<Narration>Chapter {years} · {identity.location}</Narration>
						<h1 className={`${display} mt-6 text-[clamp(4rem,12vw,9.5rem)] leading-[0.85]`}>
							Omkar
							<br />
							<span className="text-[var(--accent)]">Arora</span>
						</h1>
						<div className="mt-auto pt-8">
							{/* Speech bubble */}
							<div className="relative inline-block max-w-md rounded-[2rem] border-[3px] border-[var(--ink)] bg-[var(--panel)] px-5 py-4">
								<p className="text-lg leading-snug font-semibold">
									{identity.title} at {identity.company}. I make the web feel instant.
								</p>
								<span className="absolute -top-[14px] left-10 size-6 rotate-45 border-t-[3px] border-l-[3px] border-[var(--ink)] bg-[var(--panel)]" />
							</div>
						</div>
					</div>
				</Panel>

				<Panel className="min-h-[20rem] md:col-span-4">
					<Image
						src="/images/profile.jpg"
						alt={identity.name}
						fill
						sizes="(min-width: 768px) 33vw, 100vw"
						className="object-cover grayscale contrast-150"
						priority
					/>
					<div className="tone pointer-events-none absolute inset-0 mix-blend-multiply dark:mix-blend-screen" />
					<Narration className="absolute right-3 bottom-3">The hero, off duty</Narration>
				</Panel>

				{/* ─── Pitch strip ─── */}
				<Panel className="p-5 md:col-span-12 md:p-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<p className="max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{identity.pitch}</p>
						<div className={`${caption} flex shrink-0 gap-3 font-bold`}>
							<a href={identity.links.resume} className="border-[3px] border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[var(--panel)] hover:bg-[var(--accent)] hover:border-[var(--accent)]">
								Resume
							</a>
							<a href={`mailto:${identity.email}`} className="border-[3px] border-[var(--ink)] px-4 py-3 hover:bg-[var(--ink)] hover:text-[var(--panel)]">
								Email
							</a>
						</div>
					</div>
				</Panel>

				{/* ─── Shipped at ixigo ─── */}
				<div id="shipped" className="border-[3px] border-[var(--ink)] bg-[var(--accent)] px-5 py-3 md:col-span-12">
					<h2 className={`${display} text-3xl tracking-wide text-[var(--on-accent)] sm:text-4xl`}>
						Shipped at {identity.company}
					</h2>
				</div>
				{shipped.map((feature, index) => (
					<Panel key={feature.name} className="flex flex-col p-5 md:col-span-4">
						<div className="flex items-start justify-between gap-2">
							<Narration>#{String(index + 1).padStart(2, "0")} · {feature.shipped}</Narration>
							{feature.placeholder && <PlaceholderMark />}
						</div>
						<h3 className={`${display} mt-4 text-3xl leading-none`}>{feature.name}</h3>
						<p className="mt-2 flex-1 text-[var(--muted)]">{feature.summary}</p>
						<p className={`${caption} mt-4 text-[var(--muted)]`}>{feature.role}</p>
						<div className="mt-4 flex items-end justify-between border-t-[3px] border-[var(--ink)] pt-3">
							<span className={`${caption} font-bold`}>Power level</span>
							<span className={`${display} text-4xl leading-none text-[var(--accent)]`}>
								{feature.impact?.value ?? "—"}
							</span>
						</div>
					</Panel>
				))}

				{/* ─── Featured project ─── */}
				{featured && (
					<Panel className="p-6 md:col-span-7 md:row-span-3 md:p-8">
						<div id="projects" className="speed pointer-events-none absolute -right-1/4 -bottom-1/4 size-[120%]" />
						<div className="relative flex h-full flex-col">
							<Narration>Featured · {featured.year}</Narration>
							<h3 className={`${display} mt-4 text-6xl leading-none sm:text-7xl`}>{featured.name}</h3>
							<p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--muted)]">{featured.summary}</p>
							{featured.highlight && (
								<div className="my-8">
									<p className={`${display} text-[clamp(5rem,14vw,9rem)] leading-[0.8] text-[var(--accent)] [-webkit-text-stroke:3px_var(--ink)]`}>
										{featured.highlight.value}
									</p>
									<p className={`${caption} mt-2 font-bold`}>{featured.highlight.label}</p>
								</div>
							)}
							<div className={`${caption} mt-auto flex flex-wrap gap-3 font-bold`}>
								{featured.href && (
									<a href={featured.href} target="_blank" rel="noopener noreferrer" className="border-[3px] border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[var(--panel)] hover:bg-[var(--accent)] hover:border-[var(--accent)]">
										Play it ↗
									</a>
								)}
								{featured.caseStudy && (
									<a href={featured.caseStudy.href} target="_blank" rel="noopener noreferrer" className="border-[3px] border-[var(--ink)] bg-[var(--panel)] px-4 py-3 hover:bg-[var(--ink)] hover:text-[var(--panel)]">
										{featured.caseStudy.label} ↗
									</a>
								)}
							</div>
						</div>
					</Panel>
				)}
				{others.map((project) => (
					<a
						key={project.name}
						href={project.href ?? project.repo}
						target="_blank"
						rel="noopener noreferrer"
						className="group relative block border-[3px] border-[var(--ink)] bg-[var(--panel)] p-5 transition-transform hover:-translate-y-1 md:col-span-5"
					>
						<h3 className={`${display} text-2xl leading-none group-hover:text-[var(--accent)]`}>{project.name}</h3>
						<p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{project.summary}</p>
						<p className={`${caption} mt-3 text-[var(--muted)]`}>{project.stack.slice(0, 3).join(" · ")}</p>
					</a>
				))}

				{/* ─── Off the clock: the biggest spread ─── */}
				<div id="off" className="border-[3px] border-[var(--ink)] bg-[var(--panel)] md:col-span-12">
					<div className="flex items-center justify-between border-b-[3px] border-[var(--ink)] px-5 py-3">
						<h2 className={`${display} text-3xl tracking-wide sm:text-4xl`}>Off the clock</h2>
						<span className={`${caption} font-bold text-[var(--accent)]`}>Bonus chapter</span>
					</div>
					{/* Gaps over an ink ground draw the gutters, whatever the column count. */}
					<div className="grid grid-cols-2 gap-[3px] bg-[var(--ink)] md:grid-cols-5">
						{interests.map((interest) => (
							<div
								key={interest.key}
								className="bg-[var(--panel)] p-5 last:col-span-2 md:last:col-span-1"
							>
								<p className="text-4xl">{interest.emoji}</p>
								<h3 className={`${display} mt-4 text-2xl leading-none`}>{interest.label}</h3>
								<p className="mt-2 text-sm leading-snug text-[var(--muted)]">{interest.line}</p>
								{interest.picks.map((pick) => (
									<p key={pick.name} className={`${caption} mt-3 ${pick.placeholder ? "text-[var(--accent)]" : ""}`}>
										{pick.placeholder ? `[${pick.name}]` : pick.name}
									</p>
								))}
							</div>
						))}
					</div>
				</div>

				{/* ─── Writing + career ─── */}
				<Panel className="p-5 md:col-span-7 md:p-6">
					<div className="flex items-baseline justify-between">
						<h2 className={`${display} text-3xl`}>Writing</h2>
						<Link href="/blog" className={`${caption} font-bold hover:text-[var(--accent)]`}>All posts →</Link>
					</div>
					<ol className="mt-4">
						{posts.map((post) => (
							<li key={post.slug} className="border-t-2 border-[var(--ink)]">
								<Link href={`/blog/${post.slug}`} className="group block py-4">
									<p className={`${caption} text-[var(--muted)]`}>{shortDate(post.publishedAt)}</p>
									<p className="mt-1 text-lg leading-snug font-bold group-hover:text-[var(--accent)]">{post.title}</p>
								</Link>
							</li>
						))}
					</ol>
				</Panel>
				<Panel className="p-5 md:col-span-5 md:p-6">
					<h2 className={`${display} text-3xl`}>Story so far</h2>
					<ol className="mt-4">
						{roles.map((role) => (
							<li key={role.company} className="border-t-2 border-[var(--ink)] py-4">
								<div className="flex items-baseline justify-between gap-3">
									<p className={`${display} text-xl leading-none`}>{role.company}</p>
									<span className={`${caption} text-[var(--muted)]`}>{role.from}–{role.to}</span>
								</div>
								<p className={`${caption} mt-1 text-[var(--muted)]`}>{role.title}</p>
								<p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{role.summary}</p>
							</li>
						))}
					</ol>
				</Panel>

				{/* ─── Last page ─── */}
				<Panel className="p-6 md:col-span-12 md:p-10">
					<div className="tone pointer-events-none absolute inset-0" style={{ maskImage: "linear-gradient(to left, black, transparent 60%)", WebkitMaskImage: "linear-gradient(to left, black, transparent 60%)" }} />
					<div id="contact" className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
						<div>
							<p className={`${display} text-[clamp(3rem,9vw,6.5rem)] leading-[0.85]`}>
								To be <span className="text-[var(--accent)]">continued…</span>
							</p>
							<a href={`mailto:${identity.email}`} className="mt-4 inline-block text-lg font-bold underline decoration-[3px] underline-offset-4 hover:text-[var(--accent)] break-all">
								{identity.email}
							</a>
						</div>
						<div className={`${caption} flex gap-5 font-bold`}>
							<a href={identity.links.github} className="hover:text-[var(--accent)]">GitHub</a>
							<a href={identity.links.linkedin} className="hover:text-[var(--accent)]">LinkedIn</a>
							<a href={identity.links.resume} className="hover:text-[var(--accent)]">Resume</a>
						</div>
					</div>
				</Panel>
			</div>
		</div>
	);
}
