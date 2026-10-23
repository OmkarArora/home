import Link from "next/link";

import { mono } from "./ui";

/**
 * The home page's call to action: the work first, the résumé one click away
 * (in a new tab, so the site stays open behind it).
 */
export function HeroActions({ resume }: { resume: string }) {
	return (
		<div className={`${mono} flex flex-wrap gap-3 text-xs uppercase tracking-wider`}>
			<Link
				href="/work"
				className="bg-[var(--ink)] px-4 py-3 font-bold text-[var(--bg)] transition-transform hover:-translate-y-0.5"
			>
				▶ See the work
			</Link>
			<a
				href={resume}
				target="_blank"
				rel="noopener noreferrer"
				className="border border-[var(--ink)] px-4 py-3 font-bold transition-colors hover:bg-[var(--ink)] hover:text-[var(--bg)]"
			>
				Resume ↗
			</a>
		</div>
	);
}
