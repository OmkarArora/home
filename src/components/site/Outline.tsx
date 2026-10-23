"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/posts";

import { label, mono } from "./ui";

/** How far down the window a heading must have scrolled to count as "being read". */
const READING_LINE = 140;

/** The id of the heading the reader is under right now. */
function useCurrent(ids: string[]) {
	const [current, setCurrent] = useState<string | null>(null);

	useEffect(() => {
		let frame = 0;
		const find = () => {
			frame = 0;
			let found: string | null = null;
			for (const id of ids) {
				const heading = document.getElementById(id);
				if (heading && heading.getBoundingClientRect().top <= READING_LINE) found = id;
			}
			setCurrent(found);
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(find);
		};
		find();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			cancelAnimationFrame(frame);
		};
	}, [ids]);

	return current;
}

function Links({ items, current }: { items: Heading[]; current: string | null }) {
	return (
		<ol className="space-y-2 text-sm leading-snug">
			{items.map((item) => {
				const on = item.id === current;
				return (
					<li key={item.id}>
						<a
							href={`#${item.id}`}
							aria-current={on ? "location" : undefined}
							className={`block border-l-2 pl-3 transition-colors ${
								on
									? "border-[var(--lime)] font-bold text-[var(--ink)]"
									: "border-transparent text-[var(--dim)] hover:text-[var(--ink)]"
							}`}
						>
							{item.text}
						</a>
					</li>
				);
			})}
		</ol>
	);
}

/**
 * "On this page". Beside the post on wide screens, where it follows the
 * scroll; folded away under the title on narrow ones.
 */
export function Outline({ items }: { items: Heading[] }) {
	const [ids] = useState(() => items.map((item) => item.id));
	const current = useCurrent(ids);

	if (items.length < 2) return null;

	return (
		<>
			<details className="mb-10 border border-[var(--ink)] lg:hidden">
				<summary className={`${mono} cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-wider`}>
					On this page · {items.length}
				</summary>
				<nav aria-label="On this page" className="border-t border-[var(--line)] p-4">
					<Links items={items} current={current} />
				</nav>
			</details>

			<nav
				aria-label="On this page"
				className="sticky top-8 col-start-2 row-start-1 hidden max-h-[calc(100vh-4rem)] self-start overflow-y-auto lg:block"
			>
				<p className={`${label} mb-4`}>On this page</p>
				<Links items={items} current={current} />
			</nav>
		</>
	);
}
