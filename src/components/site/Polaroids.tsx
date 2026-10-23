"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";

import { PlaceholderTag, label, mono } from "./ui";

/**
 * The stack beside the home page headline: photos, art, the newest post and the
 * latest work, each a polaroid that opens what it shows. Drag the top one aside,
 * or press Next, and it goes to the back.
 */

export type Snap =
	| { kind: "photo" | "art"; src?: string; alt: string; caption: string; href?: string }
	| { kind: "post"; title: string; meta: string; caption: string; href: string }
	| { kind: "work"; title: string; meta: string; caption: string; href: string };

const tilt = [-4, 3, -2, 5, -3, 2];

export function Polaroids({ snaps }: { snaps: Snap[] }) {
	const [order, setOrder] = useState(snaps.map((_, i) => i));
	// A drag ends with a click; this keeps that click from opening the card.
	const dragged = useRef(false);
	const next = () => setOrder((o) => [...o.slice(1), o[0]]);

	return (
		<div>
			<div className="relative mx-auto h-[23rem] w-[17rem]">
				{order
					.slice()
					.reverse()
					.map((index, depth, all) => {
						const snap = snaps[index];
						const isTop = depth === all.length - 1;
						return (
							<motion.figure
								key={index}
								drag={isTop ? "x" : false}
								dragSnapToOrigin
								onDragStart={() => (dragged.current = true)}
								onDragEnd={(_, info) => Math.abs(info.offset.x) > 80 && next()}
								onPointerDown={() => (dragged.current = false)}
								initial={false}
								animate={{ rotate: tilt[index % tilt.length], scale: isTop ? 1 : 0.97, y: isTop ? 0 : 4 }}
								whileDrag={{ rotate: 0, scale: 1.04 }}
								transition={{ type: "spring", stiffness: 300, damping: 24 }}
								aria-hidden={!isTop}
								className={`absolute inset-0 flex flex-col border border-[var(--line)] bg-[#fafaf5] p-3 shadow-[0_10px_30px_rgb(0_0_0/0.18)] ${isTop ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
								style={{ zIndex: depth }}
							>
								<Face snap={snap} />
								<figcaption className={`${mono} flex h-11 items-center justify-between gap-2 pt-1 text-sm text-[#0c0c0d]`}>
									<span className="truncate">{snap.caption}</span>
									{snap.href ? (
										<a
											href={snap.href}
											tabIndex={isTop ? 0 : -1}
											onClick={(event) => dragged.current && event.preventDefault()}
											draggable={false}
											className="shrink-0 bg-[#0c0c0d] px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#f3f3ee] hover:bg-[#3f6212]"
											aria-label={`Open: ${snap.caption}`}
										>
											Open ↗
										</a>
									) : (
										<PlaceholderTag />
									)}
								</figcaption>
							</motion.figure>
						);
					})}
			</div>
			<div className="mt-6 flex items-center justify-between">
				<p className={label} aria-live="polite">
					{snaps[order[0]].caption} · {order[0] + 1} / {snaps.length}
				</p>
				<button
					type="button"
					onClick={next}
					className={`${mono} border border-[var(--ink)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[var(--ink)] hover:text-[var(--bg)]`}
				>
					Next →
				</button>
			</div>
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
		<div className={face}>
			{/* eslint-disable-next-line @next/next/no-img-element -- a small fixed crop inside a toy */}
			<img src={snap.src} alt={snap.alt} draggable={false} className="size-full object-cover" />
		</div>
	);
}
