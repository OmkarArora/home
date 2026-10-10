import type { Metadata } from "next";

import { Reveal } from "@/components/lab/a/Reveal";
import { Trace } from "@/components/lab/a/Trace";
import { PageHead, label, mono } from "@/components/lab/a/ui";
import { type Shipped, period, productLabel, surfaceLabel, timeline } from "@/content/ixigo";
import { identity } from "@/content/profile";

export const metadata: Metadata = {
	title: "Patch notes — Omkar Arora",
	description: "What Omkar Arora has shipped at ixigo, month by month: flights and cabs on the web.",
};

/** A stop on the line: the month, which lights up once the line reaches it. */
const stop = `${mono} text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors duration-300 data-[on=true]:text-[var(--ink)]`;

function Tags({ item }: { item: Shipped }) {
	return (
		<p className={`${label} flex flex-wrap items-center gap-x-3 gap-y-1`}>
			<span className="bg-[var(--ink)] px-1.5 py-0.5 text-[var(--bg)]">{productLabel[item.product]}</span>
			<span>{item.surfaces.map((surface) => surfaceLabel[surface]).join(" + ")}</span>
			<span>{item.when}</span>
		</p>
	);
}

/** Where a screen recording goes: phone-shaped, since most of this is mobile web. */
function Clip({ item }: { item: Shipped }) {
	const frame = "aspect-[9/16] w-full max-w-[13rem] border border-[var(--ink)] bg-[var(--card)]";
	if (!item.media) {
		return (
			<div
				className={`${frame} ${mono} flex items-center justify-center border-dashed border-[var(--muted)] p-4 text-center text-[10px] uppercase tracking-widest text-[var(--muted)]`}
			>
				Clip to come
			</div>
		);
	}
	return item.media.type === "video" ? (
		<video
			className={`${frame} object-cover`}
			src={item.media.src}
			poster={item.media.poster}
			aria-label={item.media.alt}
			autoPlay
			muted
			loop
			playsInline
		/>
	) : (
		// eslint-disable-next-line @next/next/no-img-element -- GIFs must stay animated
		<img className={`${frame} object-cover`} src={item.media.src} alt={item.media.alt} loading="lazy" />
	);
}

function Entry({ item, index }: { item: Shipped; index: number }) {
	return (
		<Reveal
			as="article"
			index={index}
			className={
				item.feature
					? "grid gap-8 border border-[var(--ink)] p-6 md:grid-cols-[1fr_13rem] md:p-8"
					: "border-b border-[var(--line)] py-6"
			}
		>
			<div className="min-w-0">
				<Tags item={item} />
				<h3
					className={`mt-3 font-extrabold tracking-tight ${item.feature ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
				>
					{item.title}
				</h3>
				{item.role && <p className={`${label} mt-2 text-[var(--accent-ink)]`}>{item.role}</p>}
				<p className="mt-3 max-w-2xl leading-relaxed text-[var(--muted)]">{item.summary}</p>
				{item.points.length > 0 && (
					<ul className="mt-4 max-w-2xl space-y-1.5 text-sm leading-relaxed">
						{item.points.map((point) => (
							<li key={point} className="grid grid-cols-[1rem_1fr]">
								<span className="text-[var(--accent-ink)]">+</span>
								{point}
							</li>
						))}
					</ul>
				)}
				<p className={`${label} mt-5`}>{item.skills.join(" · ")}</p>
			</div>
			{item.feature && <Clip item={item} />}
		</Reveal>
	);
}

export default function Work() {
	const months = timeline();

	return (
		<>
			<PageHead kicker={`Patch notes · shipped at ${identity.company}`} title="Patch notes.">
				Features, cross-sell surfaces and analytics work across ixigo&apos;s flights and cabs web apps,{" "}
				{period}. Newest first.
			</PageHead>

			<Trace className="mt-4">
				<section className="pb-14">
					<h2 data-trace-node className={stop}>
						Now
					</h2>
					<p className="mt-3 max-w-xl text-[var(--muted)]">
						More is in review and in the works. It goes here once it ships.
					</p>
				</section>

				{months.map((month) => (
					<section key={month.key} className="pb-16">
						<h2 data-trace-node className={stop}>
							{month.label}
							<span className="ml-3 font-normal">
								{month.shipped.length + month.wins.length} shipped
							</span>
						</h2>

						<div className="mt-6 space-y-4">
							{month.shipped.map((item, index) => (
								<Entry key={item.title} item={item} index={index} />
							))}
						</div>

						{month.wins.length > 0 && (
							<Reveal className="mt-8">
								<p className={label}>Also shipped</p>
								<ul className="mt-3">
									{month.wins.map((win) => (
										<li
											key={win.what}
											className="grid gap-x-4 border-b border-[var(--line)] py-3 sm:grid-cols-[4.5rem_1fr]"
										>
											<span className={`${label} sm:pt-1`}>{productLabel[win.product]}</span>
											<span>
												{win.what}
												{win.note && (
													<span className="block text-sm text-[var(--muted)]">{win.note}</span>
												)}
											</span>
										</li>
									))}
								</ul>
							</Reveal>
						)}
					</section>
				))}
			</Trace>
		</>
	);
}
