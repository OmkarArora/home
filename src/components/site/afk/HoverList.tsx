"use client";

import { AnimatePresence, motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

import { type Pic, afk } from "@/content/afk";

import { Polaroid, PolaroidPhoto } from "../Polaroid";
import { mono } from "../ui";

const tilt = [-4, 3, -2, 4, -3];

/** Each polaroid lands a beat after the one before. */
const land = (i: number) =>
	({
		initial: { opacity: 0, y: 24, scale: 0.85, rotate: 0 },
		animate: { opacity: 1, y: 0, scale: 1, rotate: tilt[i % tilt.length] },
		exit: { opacity: 0, y: 12, scale: 0.9, transition: { duration: 0.12 } },
		transition: { type: "spring", stiffness: 380, damping: 26, delay: i * 0.07 },
	}) as const;

/**
 * A stack of big words, one per interest. Pointing at one (or focusing it)
 * lights it up and fans its pictures out in a row beside it, one after the
 * other, and the note on the right becomes its line. Below 1024px there isn't
 * room beside the word, so a tap opens the row under it instead.
 */
export function HoverList() {
	const [active, setActive] = useState<string | null>(null);
	// Where the row starts: just past the end of the lit word, which differs per word.
	const [left, setLeft] = useState(0);
	const light = (key: string, button: HTMLElement) => {
		const word = button.firstElementChild?.getBoundingClientRect();
		const row = button.getBoundingClientRect();
		if (word) setLeft(word.right - row.left + 32);
		setActive(key);
	};
	// A mouse has already opened the row by hovering, so its click shouldn't close it again; a tap toggles.
	const pointer = useRef("mouse");

	return (
		<ul onPointerLeave={() => setActive(null)} className="border-t border-[var(--line)]">
			{afk.map((item) => {
				const open = active === item.key;
				return (
					<li key={item.key} className={`relative border-b border-[var(--line)] ${open ? "z-10" : ""}`}>
						<button
							type="button"
							onPointerEnter={(event) => event.pointerType === "mouse" && light(item.key, event.currentTarget)}
							// Keyboard focus opens it; a tap or click focuses too, and those are handled by onClick.
							onFocus={(event) => event.currentTarget.matches(":focus-visible") && light(item.key, event.currentTarget)}
							onPointerDown={(event) => (pointer.current = event.pointerType)}
							onClick={(event) => (open && pointer.current !== "mouse" ? setActive(null) : light(item.key, event.currentTarget))}
							aria-expanded={open}
							className="flex w-full items-baseline justify-between gap-6 py-4 text-left"
						>
							<span className="relative shrink-0 text-[clamp(2.25rem,6vw,4.5rem)] leading-none font-extrabold tracking-[-0.035em] [font-stretch:85%]">
								{open && <span className="absolute inset-x-[-0.06em] bottom-[0.02em] top-[0.2em] -skew-x-6 bg-[var(--lime)]" />}
								<span className={`relative ${open ? "text-[#0c0c0d]" : ""}`}>{item.label}</span>
							</span>
							{/* Wide screens: the note, or the line while it's lit. Narrower: always the note. */}
							<Grow className={`${mono} hidden max-w-[13rem] text-right text-xs text-balance text-[var(--dim)] lg:block ${open ? "" : "uppercase tracking-widest"}`}>
								{open ? item.line : item.note}
							</Grow>
							<span className={`${mono} text-right text-xs uppercase tracking-widest text-[var(--dim)] lg:hidden`}>{item.note}</span>
						</button>

						{/* Wide screens: the row floats just past the word, over the rows around it. */}
						<AnimatePresence>
							{open && item.pictures.length > 0 && (
								<div aria-hidden style={{ left }} className="pointer-events-none absolute top-1/2 hidden -translate-y-1/2 lg:flex">
									{/* Each overlaps the last a little, like a fanned hand of polaroids. */}
									{item.pictures.map((pic, i) => (
										<motion.div key={pic.src} {...land(i)} className={`w-28 xl:w-32 ${i > 0 ? "-ml-4" : ""}`}>
											<Card pic={pic} />
										</motion.div>
									))}
								</div>
							)}
						</AnimatePresence>

						{/* Phones and tablets: the line, then the row, open under the word. */}
						<AnimatePresence initial={false}>
							{open && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									className="overflow-hidden lg:hidden"
								>
									<p className="pb-4 text-balance text-[var(--dim)]">{item.line}</p>
									{item.pictures.length > 0 && (
										// Padded all round so a tilted card's corners aren't clipped; fanned like the desktop row.
										<div className="flex overflow-x-auto px-3 pt-2 pb-6">
											{item.pictures.map((pic, i) => (
												<motion.div key={pic.src} {...land(i)} className={`w-28 shrink-0 sm:w-32 ${i > 0 ? "-ml-6" : ""}`}>
													<Card pic={pic} />
												</motion.div>
											))}
										</div>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</li>
				);
			})}
		</ul>
	);
}

/**
 * Text whose box eases to its new height when the text changes, so the row
 * (and every row below it) glides instead of jumping. `overflow: clip` keeps
 * the text on the word's baseline, which `hidden` wouldn't.
 */
function Grow({ className, children }: { className: string; children: React.ReactNode }) {
	const inner = useRef<HTMLSpanElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");
	// After every render: same height, no update; new text, a new target.
	useLayoutEffect(() => {
		if (inner.current) setHeight(inner.current.offsetHeight);
	});
	return (
		<motion.span
			initial={false}
			animate={{ height }}
			transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
			className={`overflow-clip ${className}`}
		>
			<span ref={inner} className="block">
				{children}
			</span>
		</motion.span>
	);
}

function Card({ pic }: { pic: Pic }) {
	return (
		<Polaroid caption={<span className="truncate">{pic.caption}</span>}>
			<PolaroidPhoto src={pic.src} alt={pic.alt} contain={pic.contain} sizes="128px" className="aspect-[3/4]" />
		</Polaroid>
	);
}
