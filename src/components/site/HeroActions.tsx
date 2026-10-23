"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { mono } from "./ui";

/**
 * The home page's call to action: the work first, the résumé one click away
 * (in a new tab, so the site stays open behind it).
 *
 * Two versions, compared with `?cta=link`: the résumé as a second button, or
 * as a small link under the main one.
 */
export function HeroActions({ resume }: { resume: string }) {
	const [asLink, setAsLink] = useState(false);
	useEffect(() => setAsLink(new URLSearchParams(window.location.search).get("cta") === "link"), []);

	const primary = (
		<Link
			href="/work"
			className="bg-[var(--ink)] px-4 py-3 font-bold text-[var(--bg)] transition-transform hover:-translate-y-0.5"
		>
			▶ See the work
		</Link>
	);

	if (asLink) {
		return (
			<div className={`${mono} flex flex-wrap items-center gap-x-6 gap-y-4 text-xs uppercase tracking-wider`}>
				{primary}
				<a
					href={resume}
					target="_blank"
					rel="noopener noreferrer"
					className="text-[var(--dim)] underline decoration-[var(--lime)] decoration-2 underline-offset-4 hover:text-[var(--ink)]"
				>
					or grab the résumé ↗
				</a>
			</div>
		);
	}

	return (
		<div className={`${mono} flex flex-wrap gap-3 text-xs uppercase tracking-wider`}>
			{primary}
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
