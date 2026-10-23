"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

import { mono } from "@/components/site/ui";

/**
 * A full-screen "pause menu": a pulsing PAUSED badge, big numbered links, and
 * a Continue button to close it. Built as the phone menu and kept for the
 * Arcade; not used anywhere yet.
 *
 * It closes on Escape, on a link or on Continue; focus starts on the first
 * link, stays inside while open, and the page behind doesn't scroll. The
 * opener should take focus back in `onClose`.
 */
export function PauseMenu({
	open,
	onClose,
	items,
	current,
	footer,
}: {
	open: boolean;
	onClose: () => void;
	items: Array<{ href: string; label: string }>;
	/** The href to mark as the current one. */
	current?: string;
	footer?: React.ReactNode;
}) {
	const screen = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const page = document.documentElement;
		const before = page.style.overflow;
		page.style.overflow = "hidden";
		screen.current?.querySelector<HTMLElement>("a")?.focus();

		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
			if (event.key === "Tab" && screen.current) {
				const stops = [...screen.current.querySelectorAll<HTMLElement>("a, button")];
				const at = stops.indexOf(document.activeElement as HTMLElement);
				const to = event.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : at === stops.length - 1 ? 0 : at + 1;
				event.preventDefault();
				stops[to]?.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => {
			page.style.overflow = before;
			document.removeEventListener("keydown", onKey);
		};
	}, [open, onClose]);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					ref={screen}
					role="dialog"
					aria-modal="true"
					aria-label="Menu"
					initial={{ opacity: 0, scale: 1.04 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 1.04 }}
					transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
					className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] px-5 pt-24 pb-8 sm:px-8"
				>
					<p className={`${mono} flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em]`}>
						<span className="bg-[var(--lime)] px-1.5 py-0.5 text-[#0c0c0d]">❚❚</span>
						<span className="animate-pulse motion-reduce:animate-none">Paused</span>
					</p>

					<nav aria-label="Main" className="mt-8 flex-1">
						<ul className="space-y-2">
							{items.map((item, i) => {
								const active = item.href === current;
								return (
									<motion.li
										key={item.href}
										initial={{ opacity: 0, y: 14 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.06 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
									>
										<Link
											href={item.href}
											onClick={onClose}
											aria-current={active ? "page" : undefined}
											className="group flex items-baseline gap-4 py-2"
										>
											<span className={`${mono} w-6 text-xs text-[var(--dim)]`}>{String(i + 1).padStart(2, "0")}</span>
											<span className="relative text-5xl leading-none font-extrabold tracking-[-0.035em] [font-family:var(--font-display)] [font-stretch:85%]">
												{active && <span className="absolute inset-x-[-0.08em] bottom-[0.02em] top-[0.2em] -skew-x-6 bg-[var(--lime)]" />}
												<span className={`relative ${active ? "text-[#0c0c0d]" : "group-hover:text-[var(--accent-ink)]"}`}>{item.label}</span>
											</span>
										</Link>
									</motion.li>
								);
							})}
						</ul>
					</nav>

					<button
						type="button"
						onClick={onClose}
						className={`${mono} mb-6 w-full bg-[var(--ink)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--bg)]`}
					>
						▶ Continue
					</button>
					{footer}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
