/** The pieces every page of the site is built from. */

import { Reveal } from "./Reveal";

export const nav = [
	{ href: "/work", label: "Work" },
	{ href: "/projects", label: "Projects" },
	{ href: "/blog", label: "Writing" },
	{ href: "/about", label: "About" },
	{ href: "/arcade", label: "Arcade" },
];

/** For `.rise` elements: their place in the opening sequence. */
export const riseAt = (step: number) => ({ "--rise": step }) as React.CSSProperties;

export const mono = "[font-family:var(--font-code)]";
export const label = `${mono} text-xs uppercase tracking-[0.18em] text-[var(--dim)]`;

/**
 * A section's heading. Titles are in the site's game voice ("Loadout", "AFK"),
 * so `meaning` says the same thing plainly. It's part of the heading, hidden
 * from view, so search engines, scrapers and screen readers read
 * "Loadout: skills and tech stack". The `//` is drawn by CSS, outside the text.
 */
export function SectionHead({ tag, title, meaning }: { tag: string; title: string; meaning: string }) {
	return (
		<Reveal className="flex items-baseline justify-between gap-4 border-b border-[var(--ink)] pb-3">
			<h2 className={`${mono} text-sm font-bold uppercase tracking-[0.14em]`}>
				<span aria-hidden className="mr-[1ch] text-[var(--accent-ink)] before:content-['//']" />
				{title}
				<span className="sr-only">: {meaning}</span>
			</h2>
			<span className={label}>{tag}</span>
		</Reveal>
	);
}

/** A page's opening: a mono kicker, then a big headline. */
export function PageHead({
	kicker,
	title,
	meaning,
	children,
}: {
	/** The title said plainly, for search engines and screen readers (see `SectionHead`). */
	meaning?: string;
	kicker: string;
	title: React.ReactNode;
	children?: React.ReactNode;
}) {
	return (
		<header className="py-14 md:py-20">
			<p className={`${label} rise`} style={riseAt(0)}>
				{kicker}
			</p>
			<h1 style={riseAt(1)} className="rise mt-5 text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
				{title}
				{meaning && <span className="sr-only"> {meaning}</span>}
			</h1>
			{children && (
				<p style={riseAt(2)} className="rise mt-6 max-w-xl text-lg leading-relaxed text-[var(--dim)]">{children}</p>
			)}
		</header>
	);
}

export function PlaceholderTag() {
	return (
		<span
			className={`${mono} border border-dashed border-[var(--dim)] px-1.5 py-0.5 text-xs uppercase tracking-widest text-[var(--dim)]`}
		>
			placeholder
		</span>
	);
}
