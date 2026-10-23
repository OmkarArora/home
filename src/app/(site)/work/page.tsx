import type { Metadata } from "next";

import { InViewVideo } from "@/components/site/InViewVideo";
import { Reveal } from "@/components/site/Reveal";
import { Screens } from "@/components/site/Screens";
import { Trace } from "@/components/site/Trace";
import { PageHead, PlaceholderTag, label, mono } from "@/components/site/ui";
import { type Media, type Shipped, alsoShipped, majors, productLabel, since, surfaceLabel } from "@/content/ixigo";
import { identity } from "@/content/profile";
import { type Product, also, company, outcomes, products } from "@/content/sparklin";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/work", {
		title: "Patch notes — Omkar Arora",
		description:
			"What Omkar Arora has shipped: flights and cabs on the web at ixigo, and three products at Sparklin before that.",
	}),
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
		</p>
	);
}

/** A screen recording of the feature: phone-shaped, since most of this is mobile web. */
function Clip({ media }: { media: Media }) {
	const frame = "aspect-[9/16] w-full border border-[var(--ink)] bg-[var(--card)]";
	return (
		<figure className="mx-auto w-full max-w-[11rem]">
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
					<a href={media.credit.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--ink)]">
						{media.credit.label} ↗
					</a>
				</figcaption>
			)}
		</figure>
	);
}

/** The name, the one-line summary and the tags: the part of a big feature you read first. */
function Headline({ item }: { item: Shipped }) {
	return (
		<>
			<Tags item={item} />
			<h4 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{item.title}</h4>
			<p className="mt-3 max-w-xl text-lg leading-snug">{item.summary}</p>
		</>
	);
}

/** What was built: his part, if it was a team launch, then the points. */
function Built({ item }: { item: Shipped }) {
	return (
		<>
			{item.part && (
				<div className="mb-5 max-w-xl border-l-4 border-[var(--lime)] bg-[var(--soft)] px-4 py-3">
					<p className={`${label} text-[var(--accent-ink)]`}>Team launch · My part</p>
					<p className="mt-1 font-bold">{item.part}</p>
				</div>
			)}
			<ul className="max-w-xl space-y-2">
				{item.points.map((point) => (
					<li key={point} className={plus}>
						{point}
					</li>
				))}
			</ul>
		</>
	);
}

/**
 * One of the big features: a stop of its own, and a card.
 *
 * With a clip, the text sits centred against the phone so neither side is left
 * half empty. Without one, the card splits in two: what it is on the left,
 * what was built on the right.
 */
function Major({ item }: { item: Shipped }) {
	const card = "mt-5 grid gap-8 border border-[var(--ink)] p-6 md:gap-12 md:p-10";

	return (
		<section className="pb-12">
			<h3 data-trace-node className={stop}>
				{item.when}
			</h3>
			{item.media ? (
				<Reveal
					as="article"
					className={`${card} md:grid-cols-[1fr_11rem] md:items-center`}
				>
					<div className="min-w-0">
						<Headline item={item} />
						<div className="mt-5">
							<Built item={item} />
						</div>
						<p className={`${label} mt-6`}>{item.skills.join(" · ")}</p>
					</div>
					<div>
						<Clip media={item.media} />
					</div>
				</Reveal>
			) : (
				<Reveal as="article" className={`${card} md:grid-cols-2`}>
					<div className="min-w-0">
						<Headline item={item} />
						<p className={`${label} mt-6`}>{item.skills.join(" · ")}</p>
					</div>
					<div className="min-w-0 md:border-l md:border-[var(--line)] md:pl-12">
						<p className={`${label} mb-4`}>What I built</p>
						<Built item={item} />
					</div>
				</Reveal>
			)}
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
				{product.journey && (
					<ol aria-label="Stacks, in order" className={`${mono} mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-xs font-bold uppercase tracking-wider`}>
						{product.journey.map((step, index) => {
							const last = index === product.journey!.length - 1;
							return (
								<li key={step} className="flex items-center gap-2">
									<span
										className={
											last
												? "bg-[var(--lime)] px-2 py-1 text-[#0c0c0d]"
												: "border border-[var(--line)] px-2 py-1 text-[var(--dim)]"
										}
									>
										{step}
										{last && " · led"}
									</span>
									{!last && <span aria-hidden className="text-[var(--accent-ink)]">→</span>}
								</li>
							);
						})}
					</ol>
				)}
				<ul className="mt-4 max-w-2xl space-y-1.5 text-sm leading-relaxed">
					{product.points.map((point) => (
						<li key={point} className={plus}>
							{point}
						</li>
					))}
				</ul>
				<p className={`${label} mt-4`}>
					{[product.years, ...product.skills].filter(Boolean).join(" · ")}
				</p>
				<Screens screens={product.screens} />
			</Reveal>
		</section>
	);
}

export default function Work() {
	const rest = alsoShipped();

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
					<p className={`${label} mt-3`}>{since} – now · {identity.title}</p>
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
