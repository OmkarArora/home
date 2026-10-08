import Link from "next/link";

import { PlaceholderTag, SectionHead, base, label, mono } from "@/components/lab/a/ui";
import { latestPosts } from "@/components/lab/data";
import { identity, projects, roles, shipped, yearsOfExperience } from "@/content/profile";

/**
 * Version A — Patch notes. The home page only answers "who is this, and what
 * has he shipped": the rest has a page of its own.
 */
export default async function PatchNotes() {
	const [latest] = await latestPosts(1);
	const years = yearsOfExperience();
	const [featured] = projects;

	return (
		<>
			{/* ─── Hero: headline + player card ─── */}
			<section className="grid gap-10 py-14 md:grid-cols-12 md:py-24">
				<div className="md:col-span-7">
					<p className={label}>
						{identity.title} · {identity.company}
					</p>
					<h1 className="mt-6 text-[clamp(3rem,9vw,6.75rem)] leading-[0.92] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
						Ships{" "}
						<span className="relative inline-block">
							<span className="absolute inset-x-[-0.08em] bottom-[0.08em] top-[0.18em] -z-0 -skew-x-6 bg-[var(--accent)]" />
							<span className="relative text-[#0c0c0d]">fast</span>
						</span>
						<br />
						interfaces.
					</h1>
					<p className="mt-8 max-w-lg text-lg leading-relaxed text-[var(--muted)]">{identity.pitch}</p>
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
						<div
							className={`${mono} border-b border-[var(--ink)] px-4 py-2 text-[11px] uppercase tracking-widest`}
						>
							Player card
						</div>
						<div className="p-4 sm:p-5">
							<p className="text-3xl leading-tight font-bold tracking-tight">{identity.name}</p>
							<p className="mt-1 text-sm text-[var(--muted)]">{identity.title}</p>
						</div>
						<dl className={`${mono} border-t border-[var(--line)] text-xs`}>
							{[
								["Class", "Frontend"],
								["Guild", identity.company],
								["Based", identity.location],
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

			{/* ─── Save history ─── */}
			<section className="py-12">
				<SectionHead title="Save history" tag={`${years}+ years`} />
				<ol>
					{roles.map((role) => (
						<li
							key={role.company}
							className="grid gap-x-8 gap-y-1 border-b border-[var(--line)] py-6 md:grid-cols-[7rem_19rem_1fr]"
						>
							<span className={`${mono} text-xs text-[var(--muted)] md:pt-1.5`}>
								{role.from}–{role.to}
							</span>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-xl font-bold tracking-tight">{role.company}</h3>
									{role.placeholder && <PlaceholderTag />}
								</div>
								<p className={`${label} mt-1`}>{role.title}</p>
							</div>
							<p className="mt-2 leading-relaxed text-[var(--muted)] md:mt-0 md:pt-1">{role.summary}</p>
						</li>
					))}
				</ol>
			</section>

			{/* ─── Elsewhere on the site ─── */}
			<section className="grid gap-4 py-12 md:grid-cols-2">
				{featured && (
					<Link
						href={`${base}/work`}
						className="border border-[var(--ink)] p-6 transition-colors hover:bg-[var(--accent)] hover:text-[#0c0c0d]"
					>
						<p className={`${mono} text-[11px] uppercase tracking-[0.18em] opacity-70`}>Side quests</p>
						<p className="mt-3 text-2xl font-bold tracking-tight">
							{featured.name} and {projects.length - 1} more →
						</p>
					</Link>
				)}
				{latest && (
					<Link
						href={`${base}/writing`}
						className="border border-[var(--ink)] p-6 transition-colors hover:bg-[var(--accent)] hover:text-[#0c0c0d]"
					>
						<p className={`${mono} text-[11px] uppercase tracking-[0.18em] opacity-70`}>Latest in the dev log</p>
						<p className="mt-3 text-2xl font-bold tracking-tight">{latest.title} →</p>
					</Link>
				)}
			</section>
		</>
	);
}
