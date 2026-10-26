import type { Metadata } from "next";
import Link from "next/link";

import { PageHead, label, mono } from "@/components/site/ui";

/**
 * Three ways to lay out the Arcade, to compare before one ships at /arcade.
 * Temporary: the two that lose are deleted.
 */

export const variants = [
	{ href: "/arcade/try/scene", name: "3D · Scene", note: "The real cabinet in a night scene; drag to look around." },
	{ href: "/arcade/try/illustrated", name: "A1 · Illustrated", note: "A drawn arcade cabinet, the machine on its CRT." },
	{ href: "/arcade/try/pixel", name: "A2 · Pixel", note: "The cabinet as pixel art, like a sprite." },
	{ href: "/arcade/try/floor", name: "B · Floor", note: "A row of cabinets; pick one to play." },
	{ href: "/arcade/try/cards", name: "C · Cards", note: "Every machine on the page, the site's style." },
];

export const tryMetadata = (name: string): Metadata => ({
	title: `Arcade, try ${name} — Omkar Arora`,
	robots: { index: false, follow: false },
});

export function VariantHead({ current }: { current: string }) {
	return (
		<>
			<PageHead kicker="Arcade · comparing layouts" title="Arcade." meaning="Interactive web experiments">
				The tricks this site uses, made playable. Turn the knobs.
			</PageHead>
			<nav aria-label="Layouts" className={`${mono} mb-10 flex flex-wrap gap-2 text-xs uppercase tracking-wider`}>
				<span className={`${label} self-center pr-2`}>Layout</span>
				{variants.map((v) => (
					<Link
						key={v.href}
						href={v.href}
						title={v.note}
						aria-current={v.href === current ? "page" : undefined}
						className={`px-2 py-1.5 font-bold ${v.href === current ? "bg-[var(--lime)] text-[#0c0c0d]" : "border border-[var(--line)] hover:border-[var(--ink)]"}`}
					>
						{v.name}
					</Link>
				))}
			</nav>
		</>
	);
}
