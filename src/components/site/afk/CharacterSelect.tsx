"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { label, mono } from "../ui";
import { afk } from "./data";
import { Picture } from "./HoverList";

/**
 * 2. A fighting game's character select: a grid of tiles, and a big panel for
 * whichever is picked. Hovering picks, as in the games; arrow keys move.
 */
export function CharacterSelect() {
	const [picked, setPicked] = useState(0);
	const item = afk[picked];
	const columns = 4;

	const onKey = (event: React.KeyboardEvent) => {
		const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
		const by = moves[event.key];
		if (by === undefined) return;
		event.preventDefault();
		const next = (picked + by + afk.length) % afk.length;
		setPicked(next);
		(event.currentTarget.querySelectorAll("button")[next] as HTMLButtonElement | undefined)?.focus();
	};

	return (
		<div className="grid gap-6 md:grid-cols-[1fr_20rem]">
			<div role="listbox" aria-label="Interests" onKeyDown={onKey} className="grid grid-cols-4 gap-2 self-start">
				{afk.map((entry, index) => {
					const on = index === picked;
					return (
						<button
							key={entry.key}
							type="button"
							role="option"
							aria-selected={on}
							tabIndex={on ? 0 : -1}
							onClick={() => setPicked(index)}
							onPointerEnter={(event) => event.pointerType === "mouse" && setPicked(index)}
							className={`relative aspect-square overflow-hidden border-2 text-left transition-transform ${on ? "scale-[1.04] border-[var(--lime)]" : "border-[var(--line)] hover:border-[var(--ink)]"}`}
						>
							<div className="absolute inset-0">
								<Picture item={entry} initial className="size-full" />
							</div>
							<span className={`${mono} absolute inset-x-0 bottom-0 truncate bg-[#0c0c0d]/80 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#f3f3ee]`}>
								{entry.label}
							</span>
							{on && <span className={`${mono} absolute top-1 left-1 bg-[var(--lime)] px-1 text-xs font-bold text-[#0c0c0d]`}>P1</span>}
						</button>
					);
				})}
			</div>

			<div aria-live="polite" className="border-2 border-[var(--ink)] bg-[var(--card)]">
				<AnimatePresence mode="wait" initial={false}>
					<motion.div key={item.key} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
						<Picture item={item} className="aspect-[4/3] w-full" />
						<div className="p-5">
							<p className={label}>Player 1 selects</p>
							<p className="mt-2 text-4xl leading-none font-extrabold tracking-[-0.035em] [font-stretch:85%]">{item.label}</p>
							<p className="mt-3 text-[var(--dim)]">{item.line}</p>
							{item.suggested && <p className={`${label} mt-3`}>[suggested from your photos]</p>}
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
