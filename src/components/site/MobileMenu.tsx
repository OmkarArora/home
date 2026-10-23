"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { identity } from "@/content/profile";

import { LocalTime } from "./LocalTime";
import { mono, nav } from "./ui";

/**
 * The navigation on phones: a button in the top bar that opens the links.
 *
 * Two versions, compared with `?menu=pause`: a panel that drops down from the
 * top bar, or a full-screen "pause menu". Either way it closes on Escape, on a
 * link, on the button, or (the panel) on a tap outside; focus stays inside
 * while it's open and goes back to the button after. Reduced motion turns the
 * animation into a plain fade (see `RevealConfig`).
 */
export function MobileMenu() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const [pause, setPause] = useState(false);
	const button = useRef<HTMLButtonElement>(null);
	const sheet = useRef<HTMLDivElement>(null);
	// The panel hangs from the top bar's bottom edge, wherever the page is scrolled to.
	const [top, setTop] = useState(0);

	useEffect(() => setPause(new URLSearchParams(window.location.search).get("menu") === "pause"), []);

	// A link was followed: close.
	useEffect(() => setOpen(false), [pathname]);

	useEffect(() => {
		if (!open) return;
		const page = document.documentElement;
		const before = page.style.overflow;
		page.style.overflow = "hidden";
		sheet.current?.querySelector<HTMLElement>("a")?.focus();

		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
				button.current?.focus();
			}
			// Keep Tab inside the menu and its button.
			if (event.key === "Tab" && sheet.current) {
				const stops = [button.current, ...sheet.current.querySelectorAll<HTMLElement>("a, button")].filter(Boolean) as HTMLElement[];
				const at = stops.indexOf(document.activeElement as HTMLElement);
				const to = event.shiftKey ? (at <= 0 ? stops.length - 1 : at - 1) : at === stops.length - 1 ? 0 : at + 1;
				event.preventDefault();
				stops[to].focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => {
			page.style.overflow = before;
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const links = nav.map((item, i) => {
		const active = pathname.startsWith(item.href);
		return (
			<motion.li
				key={item.href}
				initial={{ opacity: 0, y: 14 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.06 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
			>
				<Link
					href={item.href}
					onClick={() => setOpen(false)}
					aria-current={active ? "page" : undefined}
					className="group flex items-baseline gap-4 py-2"
				>
					<span className={`${mono} w-6 text-xs text-[var(--dim)]`}>{String(i + 1).padStart(2, "0")}</span>
					{/* The top bar sets mono for everything in it; the big links are in the display face. */}
					<span className="relative text-5xl leading-none font-extrabold tracking-[-0.035em] [font-family:var(--font-display)] [font-stretch:85%]">
						{active && <span className="absolute inset-x-[-0.08em] bottom-[0.02em] top-[0.2em] -skew-x-6 bg-[var(--lime)]" />}
						<span className={`relative ${active ? "text-[#0c0c0d]" : "group-hover:text-[var(--accent-ink)]"}`}>{item.label}</span>
					</span>
				</Link>
			</motion.li>
		);
	});

	const extras = (
		<div className={`${mono} flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-wider text-[var(--dim)]`}>
			<LocalTime />
			<div className="flex gap-5">
				<a href={identity.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ink)]">
					GitHub
				</a>
				<a href={identity.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ink)]">
					LinkedIn
				</a>
				<a href={identity.links.resume} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ink)]">
					Resume
				</a>
			</div>
		</div>
	);

	return (
		<>
			<button
				ref={button}
				type="button"
				onClick={() => {
					setTop(Math.max(0, button.current?.closest("header")?.getBoundingClientRect().bottom ?? 0));
					setOpen((o) => !o);
				}}
				aria-expanded={open}
				aria-controls="mobile-menu"
				aria-label={open ? "Close menu" : "Open menu"}
				className="relative z-[60] flex size-9 flex-col items-center justify-center gap-[5px] border border-[var(--ink)] bg-[var(--bg)] hover:bg-[var(--soft)] md:hidden"
			>
				<motion.span animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} className="block h-[2px] w-4 bg-[var(--ink)]" />
				<motion.span animate={{ opacity: open ? 0 : 1 }} className="block h-[2px] w-4 bg-[var(--ink)]" />
				<motion.span animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} className="block h-[2px] w-4 bg-[var(--ink)]" />
			</button>

			<AnimatePresence>
				{open && !pause && (
					<>
						{/* Tapping the page below closes the panel. */}
						<motion.div
							key="shade"
							aria-hidden
							onClick={() => setOpen(false)}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							style={{ top }}
							className="fixed inset-x-0 bottom-0 z-40 bg-[#0c0c0d]/40 md:hidden"
						/>
						<motion.div
							key="panel"
							id="mobile-menu"
							ref={sheet}
							role="dialog"
							aria-modal="true"
							aria-label="Menu"
							initial={{ clipPath: "inset(0 0 100% 0)" }}
							animate={{ clipPath: "inset(0 0 0% 0)" }}
							exit={{ clipPath: "inset(0 0 100% 0)" }}
							transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
							style={{ top }}
							className="fixed inset-x-0 z-50 border-b border-[var(--ink)] bg-[var(--bg)] px-5 pt-4 pb-6 sm:px-8 md:hidden"
						>
							<nav aria-label="Main">
								<ul>{links}</ul>
							</nav>
							<div className="mt-6 border-t border-[var(--line)] pt-4">{extras}</div>
						</motion.div>
					</>
				)}

				{open && pause && (
					<motion.div
						key="pause"
						id="mobile-menu"
						ref={sheet}
						role="dialog"
						aria-modal="true"
						aria-label="Menu"
						initial={{ opacity: 0, scale: 1.04 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 1.04 }}
						transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
						className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] px-5 pt-24 pb-8 sm:px-8 md:hidden"
					>
						<p className={`${mono} flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em]`}>
							<span className="bg-[var(--lime)] px-1.5 py-0.5 text-[#0c0c0d]">❚❚</span>
							<span className="animate-pulse motion-reduce:animate-none">Paused</span>
						</p>
						<nav aria-label="Main" className="mt-8 flex-1">
							<ul className="space-y-2">{links}</ul>
						</nav>
						<button
							type="button"
							onClick={() => {
								setOpen(false);
								button.current?.focus();
							}}
							className={`${mono} mb-6 w-full bg-[var(--ink)] py-3 text-xs font-bold uppercase tracking-widest text-[var(--bg)]`}
						>
							▶ Continue
						</button>
						{extras}
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
