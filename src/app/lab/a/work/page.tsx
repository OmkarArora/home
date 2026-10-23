import type { Metadata } from "next";

import { InViewVideo } from "@/components/lab/a/InViewVideo";
import { Reveal } from "@/components/lab/a/Reveal";
import { Screens } from "@/components/lab/a/Screens";
import { Trace } from "@/components/lab/a/Trace";
import { PageHead, PlaceholderTag, label, mono } from "@/components/lab/a/ui";
import { type Shipped, alsoShipped, majors, productLabel, since, surfaceLabel } from "@/content/ixigo";
import { type Product, also, company, outcomes, products } from "@/content/sparklin";
import { canonical } from "@/lib/site-seo";

export const metadata: Metadata = {
	title: "Patch notes — Omkar Arora",
	description:
		"What Omkar Arora has shipped: flights and cabs on the web at ixigo, and three products at Sparklin before that.",
	...canonical("/work"),
};

/** A stop on the line, which lights up once the line reaches it. */
const stop = `${mono} text-sm font-bold uppercase tracking-[0.14em] text-[var(--dim)] transition-colors duration-300 data-[on=true]:text-[var(--ink)]`;
/** A company's name: the stop that opens its chapter. */
const chapter =
	"scroll-mt-8 text-4xl font-extrabold tracking-tight text-[var(--dim)] transition-colors duration-300 data-[on=true]:text-[var(--ink)] sm:text-5xl";
const plus = "grid grid-cols-[1rem_1fr] before:text-[var(--accent-ink)] before:content-['+']";

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
				className={`${frame} ${mono} flex items-center justify-center border-dashed border-[var(--dim)] p-4 text-center text-xs uppercase tracking-widest text-[var(--dim)]`}
			>
				Clip to come
			</div>
		);
	}
	const { media } = item;
	return (
		<figure className="w-full max-w-[13rem]">
			{media.type === "video" ? (
				<InViewVideo
					src={media.src}
					label={media.alt}
					className={`${frame} object-cover`}
					style={media.width && media.height ? { aspectRatio: `${media.width} / ${media.height}` } : undefined}
				/>
			) : (
				// eslint-disable-next-line @next/next/no-img-element -- GIFs must stay animated
				<img className={`${frame} object-cover`} src={media.src} alt={media.alt} loading="lazy" />
			)}
			{media.credit && (
				<figcaption className={`${label} mt-2`}>
					From{" "}
					<a href={media.credit.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--ink)]">
						{media.credit.label} ↗
					</a>
				</figcaption>
			)}
		</figure>
	);
}

/** One of the big features: a stop of its own, and a card with room for a clip. */
function Major({ item }: { item: Shipped }) {
	return (
		<section className="pb-12">
			<h3 data-trace-node className={stop}>
				{item.when}
			</h3>
			<Reveal as="article" className="mt-5 grid gap-8 border border-[var(--ink)] p-6 md:grid-cols-[1fr_13rem] md:p-8">
				<div className="min-w-0">
					<Tags item={item} />
					<h4 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{item.title}</h4>
					{item.role && <p className={`${label} mt-2 text-[var(--accent-ink)]`}>{item.role}</p>}
					<p className="mt-3 max-w-2xl leading-relaxed text-[var(--dim)]">{item.summary}</p>
					<ul className="mt-4 max-w-2xl space-y-1.5 text-sm leading-relaxed">
						{item.points.map((point) => (
							<li key={point} className={plus}>
								{point}
							</li>
						))}
					</ul>
					<p className={`${label} mt-5`}>{item.skills.join(" · ")}</p>
				</div>
				<Clip item={item} />
			</Reveal>
		</section>
	);
}

/** A smaller feature: one line that opens to the detail. */
function Minor({ item }: { item: Shipped }) {
	return (
		<li className="border-b border-[var(--line)]">
			<details className="group">
				<summary className="grid cursor-pointer list-none grid-cols-[4.5rem_1fr_1rem] items-baseline gap-x-3 py-3 [&::-webkit-details-marker]:hidden">
					<span className={label}>{productLabel[item.product]}</span>
					<span className="font-bold tracking-tight">{item.title}</span>
					<span aria-hidden className={`${mono} text-[var(--accent-ink)] group-open:rotate-45 motion-safe:transition-transform`}>
						+
					</span>
				</summary>
				<div className="pb-5 sm:pl-[5.25rem]">
					<p className="max-w-2xl text-sm leading-relaxed text-[var(--dim)]">{item.summary}</p>
					{item.points.length > 0 && (
						<ul className="mt-3 max-w-2xl space-y-1 text-sm leading-relaxed">
							{item.points.map((point) => (
								<li key={point} className={plus}>
									{point}
								</li>
							))}
						</ul>
					)}
					<p className={`${label} mt-3`}>
						{item.surfaces.map((surface) => surfaceLabel[surface]).join(" + ")} · {item.skills.join(" · ")}
					</p>
				</div>
			</details>
		</li>
	);
}

function SparklinProduct({ product }: { product: Product }) {
	return (
		<section className="pb-12">
			<h3 data-trace-node className={`${stop} flex flex-wrap gap-x-3`}>
				{product.name}
				{product.status && <span className="font-normal">{product.status}</span>}
			</h3>
			<Reveal as="article" className="mt-4">
				<p className="flex max-w-2xl flex-wrap items-center gap-2 text-xl leading-snug font-bold tracking-tight sm:text-2xl">
					{product.what}
					{product.draft && <PlaceholderTag />}
				</p>
				<p className="mt-3 max-w-2xl leading-relaxed text-[var(--dim)]">{product.part}</p>
				<ul className="mt-4 max-w-2xl space-y-1.5 text-sm leading-relaxed">
					{product.points.map((point) => (
						<li key={point} className={plus}>
							{point}
						</li>
					))}
				</ul>
				<p className={`${label} mt-4`}>
					{product.years ?? "Years to come"} · {product.skills.join(" · ")}
				</p>
				<Screens screens={product.screens} />
			</Reveal>
		</section>
	);
}

export default function Work() {
	const rest = alsoShipped();
	const restCount = rest.reduce((sum, month) => sum + month.shipped.length + month.wins.length, 0);

	return (
		<>
			<PageHead kicker="Patch notes · newest first" title="Patch notes.">
				What I&apos;ve shipped: flights and cabs on the web at ixigo, and three products at Sparklin
				before that.
			</PageHead>

			<nav aria-label="Companies" className={`${mono} -mt-6 flex gap-3 pb-10 text-xs font-bold uppercase tracking-wider`}>
				{[
					["#ixigo", "ixigo"],
					["#sparklin", "Sparklin"],
				].map(([href, name]) => (
					<a
						key={href}
						href={href}
						className="border border-[var(--ink)] px-3 py-2 transition-colors hover:bg-[var(--lime)] hover:text-[#0c0c0d]"
					>
						{name} ↓
					</a>
				))}
			</nav>

			<Trace>
				{/* ─── ixigo ─── */}
				<section className="pb-12">
					<h2 id="ixigo" data-trace-node className={chapter}>
						ixigo
					</h2>
					<p className={`${label} mt-3`}>{since} – now · Senior Software Engineer 1</p>
					<p className="mt-3 max-w-xl text-[var(--dim)]">
						The three biggest things first. More is in review and in the works, and goes here once it
						ships.
					</p>
				</section>

				{majors().map((item) => (
					<Major key={item.title} item={item} />
				))}

				<section className="pb-20">
					<h3 data-trace-node className={stop}>
						Also shipped
						<span className="ml-3 font-normal">{restCount} more</span>
					</h3>
					<p className={`${label} mt-2`}>Tap a title for the detail</p>
					{rest.map((month) => (
						<Reveal key={month.key} className="mt-6 grid gap-x-8 gap-y-1 md:grid-cols-[6rem_1fr]">
							<p className={`${mono} pt-3 text-xs font-bold uppercase tracking-wider text-[var(--accent-ink)]`}>
								{month.label}
							</p>
							<ul className="min-w-0 border-t border-[var(--line)]">
								{month.shipped.map((item) => (
									<Minor key={item.title} item={item} />
								))}
								{month.wins.map((win) => (
									<li
										key={win.what}
										className="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-3 border-b border-[var(--line)] py-2 text-sm text-[var(--dim)]"
									>
										<span className={label}>{productLabel[win.product]}</span>
										{win.what}
									</li>
								))}
							</ul>
						</Reveal>
					))}
				</section>

				{/* ─── Sparklin ─── */}
				<section className="pb-12">
					<h2 id="sparklin" data-trace-node className={chapter}>
						{company.name}
					</h2>
					<p className={`${label} mt-3`}>
						{company.when} · {company.titles}
					</p>
					<p className="mt-3 max-w-xl text-[var(--dim)]">{company.summary}</p>
					<Reveal className="mt-8 grid max-w-3xl border border-[var(--ink)] sm:grid-cols-3">
						{outcomes.map((outcome) => (
							<div
								key={outcome.label}
								className="border-b border-[var(--line)] p-5 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
							>
								<p className="text-4xl font-extrabold tracking-tight">{outcome.value}</p>
								<p className="mt-1 font-bold">{outcome.label}</p>
								<p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">{outcome.how}</p>
							</div>
						))}
					</Reveal>
				</section>

				{products.map((product) => (
					<SparklinProduct key={product.name} product={product} />
				))}

				<section className="pb-16">
					<h3 data-trace-node className={stop}>
						Also at Sparklin
					</h3>
					<Reveal>
						<ul className="mt-4 max-w-2xl border-t border-[var(--line)]">
							{also.map((line) => (
								<li key={line} className="border-b border-[var(--line)] py-3">
									{line}
								</li>
							))}
						</ul>
					</Reveal>
				</section>
			</Trace>
		</>
	);
}
