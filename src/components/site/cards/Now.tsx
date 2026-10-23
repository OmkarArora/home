"use client";

import { motion } from "motion/react";

import type { Player } from "../PlayerCard";
import { PlaceholderTag, label, mono } from "../ui";

/** 7. What he's up to lately. Shipping and writing come from the content; the rest is his to fill in. */
export function Now({ player }: { player: Player }) {
	const rows: Array<{ verb: string; text?: string; href?: string; note?: string }> = [
		{ verb: "Shipping", text: player.latestShip.title, note: `at ${player.company} · ${player.latestShip.when}` },
		{ verb: "Writing", text: player.latestPost.title, href: player.latestPost.href },
		{ verb: "Playing" },
		{ verb: "Training" },
		{ verb: "Drawing" },
	];

	return (
		<div className="border-2 border-[var(--ink)] bg-[var(--card)]">
			<div className={`${mono} flex items-center justify-between border-b-2 border-[var(--ink)] px-4 py-2 text-xs uppercase tracking-widest`}>
				<span>Now</span>
				<span className="text-[var(--dim)]">Updated Oct 2026</span>
			</div>
			<ul>
				{rows.map((row, i) => (
					<motion.li
						key={row.verb}
						initial={{ opacity: 0, x: -12 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 + i * 0.08 }}
						className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3 border-b border-[var(--line)] px-4 py-3 last:border-b-0"
					>
						<span className={label}>{row.verb}</span>
						{row.text ? (
							<span className="min-w-0">
								{row.href ? (
									<a href={row.href} className="font-semibold underline decoration-[var(--lime)] decoration-2 underline-offset-4">
										{row.text}
									</a>
								) : (
									<span className="font-semibold">{row.text}</span>
								)}
								{row.note && <span className="block text-sm text-[var(--dim)]">{row.note}</span>}
							</span>
						) : (
							<span>
								<PlaceholderTag />
							</span>
						)}
					</motion.li>
				))}
			</ul>
		</div>
	);
}
