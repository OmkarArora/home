"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";

import { Polaroid, PolaroidPhoto } from "../Polaroid";
import { mono } from "../ui";
import { type Afk, afk } from "@/content/afk";

/**
 * A stack of big words. Pointing at one brings up its picture beside the
 * pointer; on a phone (or by keyboard) a row opens to show it inline.
 */
export function HoverList() {
	const [active, setActive] = useState<string | null>(null);
	const box = useRef<HTMLUListElement>(null);
	const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
	const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
	const current = afk.find((item) => item.key === active);

	const follow = (event: React.PointerEvent) => {
		const rect = box.current?.getBoundingClientRect();
		if (!rect) return;
		x.set(event.clientX - rect.left + 24);
		y.set(event.clientY - rect.top - 110);
	};

	return (
		<ul ref={box} onPointerMove={follow} onPointerLeave={() => setActive(null)} className="relative border-t border-[var(--line)]">
			{afk.map((item) => {
				const open = active === item.key;
				return (
					<li key={item.key} className="border-b border-[var(--line)]">
						<button
							type="button"
							onPointerEnter={(event) => event.pointerType === "mouse" && setActive(item.key)}
							onClick={() => setActive(open ? null : item.key)}
							aria-expanded={open}
							className="group flex w-full items-baseline justify-between gap-6 py-4 text-left"
						>
							<span
								className={`relative text-[clamp(2.25rem,6vw,4.5rem)] leading-none font-extrabold tracking-[-0.035em] [font-stretch:85%] transition-colors ${open ? "" : "text-[var(--ink)]"}`}
							>
								{open && <span className="absolute inset-x-[-0.06em] bottom-[0.02em] top-[0.2em] -skew-x-6 bg-[var(--lime)]" />}
								<span className={`relative ${open ? "text-[#0c0c0d]" : ""}`}>{item.label}</span>
							</span>
							<span className={`${mono} shrink-0 text-xs uppercase tracking-widest text-[var(--dim)]`}>{item.note}</span>
						</button>
						{/* Phones and keyboards: the picture and line open under the word. */}
						<AnimatePresence initial={false}>
							{open && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									className="overflow-hidden md:hidden"
								>
									<div className="flex gap-4 pb-5">
										<Picture item={item} className="h-28 w-24 shrink-0" />
										<p className="text-[var(--dim)]">{item.line}</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</li>
				);
			})}

			{/* Desktop: the picture follows the pointer. */}
			<AnimatePresence>
				{current && (
					<motion.div
						key="float"
						aria-hidden
						style={{ x, y }}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						className="pointer-events-none absolute top-0 left-0 z-10 hidden w-56 md:block"
					>
						<Polaroid className="rotate-3" caption={current.line}>
							<Picture item={current} className="aspect-[4/5] w-full" />
						</Polaroid>
					</motion.div>
				)}
			</AnimatePresence>
		</ul>
	);
}

/**
 * The interest's picture, or a lime card when there's none yet: with its note,
 * or (`initial`, for small tiles) just its first letter, big.
 */
export function Picture({ item, className = "", initial = false }: { item: Afk; className?: string; initial?: boolean }) {
	if (!item.image) {
		return initial ? (
			<div className={`flex items-center justify-center bg-[var(--lime)] pb-5 text-3xl font-extrabold sm:text-6xl text-[#0c0c0d] [font-stretch:85%] ${className}`}>
				{item.label[0]}
			</div>
		) : (
			<div className={`${mono} flex items-end bg-[var(--lime)] p-3 text-xs font-bold uppercase tracking-widest text-[#0c0c0d] ${className}`}>
				{item.note}
			</div>
		);
	}
	return <PolaroidPhoto src={item.image.src} alt={item.image.alt} contain={item.image.contain} sizes="240px" className={className} />;
}
