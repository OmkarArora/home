"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import type { Player } from "../PlayerCard";
import { label, mono } from "../ui";

const tilt = [-4, 3, -2, 5];

/** 8. A stack of polaroids: drag the top one away (or press Next) and it goes to the back. */
export function Polaroids({ player }: { player: Player }) {
	const [order, setOrder] = useState(player.snaps.map((_, i) => i));
	const next = () => setOrder((o) => [...o.slice(1), o[0]]);

	return (
		<div>
			<div className="relative mx-auto h-[23rem] w-[17rem]">
				<AnimatePresence initial={false}>
					{order
						.slice()
						.reverse()
						.map((index, depth, all) => {
							const snap = player.snaps[index];
							const isTop = depth === all.length - 1;
							return (
								<motion.figure
									key={index}
									drag={isTop ? "x" : false}
									dragSnapToOrigin
									onDragEnd={(_, info) => Math.abs(info.offset.x) > 80 && next()}
									initial={false}
									animate={{ rotate: tilt[index % tilt.length], scale: isTop ? 1 : 0.97, y: isTop ? 0 : 4 }}
									whileDrag={{ rotate: 0, scale: 1.04 }}
									transition={{ type: "spring", stiffness: 300, damping: 24 }}
									className={`absolute inset-0 border border-[var(--line)] bg-[#fafaf5] p-3 pb-14 shadow-[0_10px_30px_rgb(0_0_0/0.18)] ${isTop ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""}`}
									style={{ zIndex: depth }}
								>
									{snap.src ? (
										// eslint-disable-next-line @next/next/no-img-element -- small fixed crops in a toy
										<img src={snap.src} alt={snap.alt} draggable={false} className="size-full object-cover object-top" />
									) : (
										<div className={`${mono} flex size-full items-center justify-center bg-[#e8e8e1] text-xs uppercase tracking-widest text-[#6b6b66]`}>
											Art · coming soon
										</div>
									)}
									<figcaption className={`${mono} absolute inset-x-3 bottom-4 text-center text-sm text-[#0c0c0d]`}>{snap.caption}</figcaption>
								</motion.figure>
							);
						})}
				</AnimatePresence>
			</div>
			<div className="mt-6 flex items-center justify-between">
				<p className={label} aria-live="polite">
					{order[0] + 1} / {player.snaps.length} · drag to flick
				</p>
				<button type="button" onClick={next} className={`${mono} border border-[var(--ink)] px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[var(--ink)] hover:text-[var(--bg)]`}>
					Next →
				</button>
			</div>
		</div>
	);
}
