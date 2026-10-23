"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { mono } from "./ui";

/**
 * The stack beside the home page headline: photos, art, the newest post and the
 * latest work, each a polaroid that opens what it shows. Drag the top one aside,
 * or press the arrows, to move through it. Links off the site open in a new tab.
 *
 * The arrows and the slideshow move a card along the same path a drag does: it
 * straightens, slides out to the side, and springs back in at the other end.
 *
 * It also flicks through on its own every few seconds, except under reduced
 * motion, in a hidden tab (restarting when it's back), while the pointer or
 * focus is on it, or once paused.
 * Screen readers only hear about the changes a visitor makes.
 */

export type Snap =
	| { kind: "photo" | "art"; src?: string; alt: string; caption: string; href: string; contain?: boolean }
	| { kind: "post"; title: string; meta: string; caption: string; href: string }
	| { kind: "work"; title: string; meta: string; caption: string; href: string };

const tilt = [-4, 3, -2, 5, -3, 2];
const every = 3000;

/** Where a card goes when it's pulled aside, like the end of a drag: to the right (1) or the left (-1). */
const aside = (side: 1 | -1) =>
	({ x: 190 * side, y: 0, rotate: 0, scale: 1.04, transition: { duration: 0.2, ease: [0.4, 0, 0.7, 1] } }) as const;

/** The back, pause and forward buttons under the stack, and the Open button on each card. Hidden for now. */
const showControls = false;
const showOpen = false;

export function Polaroids({ snaps }: { snaps: Snap[] }) {
	const [order, setOrder] = useState(snaps.map((_, i) => i));
	// A drag ends with a click; this keeps that click from opening the card.
	const dragged = useRef(false);
	const next = () => setOrder((o) => [...o.slice(1), o[0]]);
	const back = () => setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);

	const reduced = useReducedMotion();
	const [paused, setPaused] = useState(false);
	// Held still while a pointer is over the stack, or keyboard focus is in it. A click
	// focuses a card's link too, and the browser hands that focus back whenever the
	// window regains focus, so only focus that shows a ring (keyboard focus) counts.
	const [hovering, setHovering] = useState(false);
	const [keyboard, setKeyboard] = useState(false);
	const holding = hovering || keyboard;
	// The card on its way out (the top one) or in (the bottom one), before the stack reorders.
	const [moving, setMoving] = useState<"next" | "back" | null>(null);
	// Each move goes out the other side from the last: right, left, right…
	const [side, setSide] = useState<1 | -1>(1);
	const [touched, setTouched] = useState(false);
	const [dragging, setDragging] = useState(false);
	const go = (way: "next" | "back") => {
		if (moving) return;
		if (reduced) (way === "next" ? next : back)();
		else setMoving(way);
	};
	const manual = (way: "next" | "back") => {
		setTouched(true);
		go(way);
	};

	// Whether the tab is out of sight. Coming back starts a fresh wait.
	const [hidden, setHidden] = useState(false);
	useEffect(() => {
		const update = () => setHidden(document.hidden);
		update();
		document.addEventListener("visibilitychange", update);
		return () => document.removeEventListener("visibilitychange", update);
	}, []);

	// One timer per card shown, so a manual change restarts the wait.
	useEffect(() => {
		if (reduced || paused || holding || hidden) return;
		const timer = setTimeout(() => go("next"), every);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `go` only reads state this already keys on
	}, [order, reduced, paused, holding, hidden]);

	return (
		<div
			onPointerEnter={() => setHovering(true)}
			onPointerLeave={() => setHovering(false)}
			onFocus={(event) => setKeyboard(event.target.matches(":focus-visible"))}
			onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setKeyboard(false)}
		>
			<div className="relative mx-auto h-[23rem] w-[17rem]">
				{/* Rendered in a fixed order and stacked by z-index: moving an element in the DOM would cancel its animation. */}
				{snaps.map((snap, index) => {
					const depth = snaps.length - 1 - order.indexOf(index);
					const isTop = depth === snaps.length - 1;
					const pulled = (isTop && moving === "next") || (depth === 0 && moving === "back");
					return (
						// The outer layer moves the card around the stack; the inner one is what a hand drags.
						<motion.div
							key={index}
							initial={false}
							animate={
								pulled
									? aside(side)
									: isTop && dragging
										? { x: 0, y: 0, rotate: 0, scale: 1.04 }
										: { x: 0, rotate: tilt[index % tilt.length], scale: isTop ? 1 : 0.97, y: isTop ? 0 : 4 }
							}
							onAnimationComplete={() => {
								if (!pulled) return;
								(moving === "next" ? next : back)();
								setMoving(null);
								setSide((s) => (s === 1 ? -1 : 1));
							}}
							transition={{ type: "spring", stiffness: 300, damping: 24 }}
							className="absolute inset-0"
							style={{ zIndex: depth }}
						>
							<motion.figure
								drag={isTop && !moving ? "x" : false}
								dragSnapToOrigin
								onDragStart={() => {
									dragged.current = true;
									setDragging(true);
								}}
								onDragEnd={(_, info) => {
									setDragging(false);
									if (Math.abs(info.offset.x) > 80) {
										setTouched(true);
										next();
									}
								}}
								onPointerDown={() => (dragged.current = false)}
								aria-hidden={!isTop}
								className={`flex size-full flex-col border border-[var(--line)] bg-[#fafaf5] p-3 shadow-[0_10px_30px_rgb(0_0_0/0.18)] ${isTop ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
							>
								{/* The picture opens it. With the Open button shown, that button is the one for keyboards and screen readers. */}
								<a
									href={snap.href}
									{...(snap.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
									tabIndex={showOpen || !isTop ? -1 : 0}
									aria-hidden={showOpen || undefined}
									aria-label={showOpen ? undefined : `Open: ${snap.caption}${snap.href.startsWith("http") ? " (new tab)" : ""}`}
									onClick={(event) => dragged.current && event.preventDefault()}
									draggable={false}
									className="flex min-h-0 flex-1 flex-col"
								>
									<Face snap={snap} />
								</a>
								<figcaption className={`${mono} flex h-11 items-center justify-between gap-2 pt-1 text-sm text-[#0c0c0d]`}>
									<span className="truncate">{snap.caption}</span>
									{showOpen && (
										<a
											href={snap.href}
											{...(snap.href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
											tabIndex={isTop ? 0 : -1}
											onClick={(event) => dragged.current && event.preventDefault()}
											draggable={false}
											className="shrink-0 bg-[#0c0c0d] px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#f3f3ee] hover:bg-[#3f6212]"
											aria-label={`Open: ${snap.caption}${snap.href.startsWith("http") ? " (new tab)" : ""}`}
										>
											Open ↗
										</a>
									)}
								</figcaption>
							</motion.figure>
						</motion.div>
					);
				})}
			</div>
			{/* What's on top, for screen readers, once a visitor has moved the stack. */}
			<p className="sr-only" aria-live={touched ? "polite" : "off"}>
				{snaps[order[0]].caption}, {order[0] + 1} of {snaps.length}
			</p>
			{showControls && (
				<div className={`${mono} mx-auto mt-6 flex w-fit border border-[var(--ink)] text-sm font-bold`}>
					<button type="button" onClick={() => manual("back")} aria-label="Previous" className="px-3.5 py-1.5 hover:bg-[var(--ink)] hover:text-[var(--bg)]">
						←
					</button>
					{!reduced && (
						<button
							type="button"
							onClick={() => setPaused((p) => !p)}
							aria-label={paused ? "Play the slideshow" : "Pause the slideshow"}
							className="border-x border-[var(--ink)] px-3.5 py-1.5 text-xs hover:bg-[var(--soft)]"
						>
							{paused ? "▶" : "❚❚"}
						</button>
					)}
					<button
						type="button"
						onClick={() => manual("next")}
						aria-label="Next"
						className={`px-3.5 py-1.5 hover:bg-[var(--ink)] hover:text-[var(--bg)] ${reduced ? "border-l border-[var(--ink)]" : ""}`}
					>
						→
					</button>
				</div>
			)}
		</div>
	);
}

/** What the polaroid shows: a picture, or for a post or a piece of work, a typeset face. */
function Face({ snap }: { snap: Snap }) {
	const face = "relative min-h-0 flex-1 overflow-hidden";

	if (snap.kind === "post" || snap.kind === "work") {
		const work = snap.kind === "work";
		return (
			<div className={`${face} flex flex-col justify-between p-5 ${work ? "bg-[#c6f03a]" : "bg-[#0c0c0d] text-[#ededE6]"}`}>
				<p className={`${mono} text-xs uppercase tracking-[0.18em] ${work ? "text-[#0c0c0d]/70" : "text-[#c6f03a]"}`}>
					{work ? "Shipped" : "Dev log · newest"}
				</p>
				<p className={`text-[1.7rem] leading-[1.02] font-extrabold tracking-[-0.02em] [font-stretch:85%] ${work ? "text-[#0c0c0d]" : ""}`}>
					{snap.title}
				</p>
				<p className={`${mono} text-xs uppercase tracking-widest ${work ? "text-[#0c0c0d]/70" : "text-[#ededE6]/60"}`}>{snap.meta}</p>
			</div>
		);
	}

	if (!snap.src) {
		return (
			<div className={`${face} flex items-center justify-center bg-[#e8e8e1]`}>
				<p className={`${mono} px-6 text-center text-xs uppercase tracking-widest text-[#6b6b66]`}>
					{snap.kind === "art" ? "Art piece" : "Photo"} · coming soon
				</p>
			</div>
		);
	}

	return (
		<div className={`${face} ${snap.contain ? "bg-white" : ""}`}>
			<Image
				src={snap.src}
				alt={snap.alt}
				fill
				sizes="272px"
				draggable={false}
				className={snap.contain ? "object-contain p-2" : "object-cover"}
			/>
		</div>
	);
}
