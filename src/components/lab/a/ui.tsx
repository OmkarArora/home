/** The pieces every version A page is built from. */

import { Reveal } from "./Reveal";

/** Where version A lives while it is in the lab. Becomes "" when it ships. */
export const base = "/lab/a";

export const nav = [
	{ href: `${base}/work`, label: "Work" },
	{ href: `${base}/projects`, label: "Projects" },
	{ href: `${base}/writing`, label: "Writing" },
	{ href: `${base}/about`, label: "About" },
];

/** For `.rise` elements: their place in the opening sequence. */
export const riseAt = (step: number) => ({ "--rise": step }) as React.CSSProperties;

export const mono = "[font-family:var(--lab-mono)]";
export const label = `${mono} text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]`;

export function SectionHead({ tag, title }: { tag: string; title: string }) {
	return (
		<Reveal className="flex items-baseline justify-between gap-4 border-b border-[var(--ink)] pb-3">
			<h2 className={`${mono} text-sm font-bold uppercase tracking-[0.14em]`}>
				<span className="text-[var(--accent-ink)]">//</span> {title}
			</h2>
			<span className={label}>{tag}</span>
		</Reveal>
	);
}

/** A page's opening: a mono kicker, then a big headline. */
export function PageHead({
	kicker,
	title,
	children,
}: {
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
			</h1>
			{children && (
				<p style={riseAt(2)} className="rise mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">{children}</p>
			)}
		</header>
	);
}

export function PlaceholderTag() {
	return (
		<span
			className={`${mono} border border-dashed border-[var(--muted)] px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--muted)]`}
		>
			placeholder
		</span>
	);
}
