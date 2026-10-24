"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

import { play } from "./sound";
import { mono } from "./ui";

/**
 * The light/dark switch in the top bar:
 *
 * - A first visit follows the system theme; flipping the switch saves a choice.
 * - Once a choice is saved, a small "Auto" button appears to hand control back
 *   to the system.
 * - It is a real `role="switch"`, checked when dark.
 *
 * The theme is known on the server only as a class on <html>, so until the
 * page hydrates the switch is drawn by CSS (`dark:`) and cannot be wrong.
 * After that Motion animates it: next-themes switches CSS transitions off
 * during a theme change, which would make a CSS-animated switch jump.
 */
/**
 * Change the theme with a View Transition: the browser snapshots the page,
 * the theme changes, and the new look blooms out of `origin` (the switch) as a
 * soft-edged circle over the old. Without View Transitions, or with reduced
 * motion, it just changes.
 *
 * The circle is a radial-gradient mask whose size grows, so its edge stays
 * feathered instead of the hard line a clip-path would draw.
 *
 * next-themes puts the class on <html> after a render, too late for the
 * snapshot, so the class is set here first; next-themes then sets the same one.
 */
function changeTheme(next: "light" | "dark", commit: () => void, origin?: { x: number; y: number }) {
	const page = document.documentElement;
	const transition = (document as Document & { startViewTransition?: (update: () => void) => { ready: Promise<void>; finished: Promise<void> } })
		.startViewTransition;
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!transition || reduced || page.classList.contains("dark") === (next === "dark")) {
		commit();
		return;
	}

	page.dataset.themeFx = "bloom";
	const view = transition.call(document, () => {
		page.classList.toggle("dark", next === "dark");
		page.style.colorScheme = next;
		commit();
	});
	view.finished.finally(() => delete page.dataset.themeFx);

	view.ready.then(() => {
		const { innerWidth: w, innerHeight: h } = window;
		const x = origin?.x ?? w;
		const y = origin?.y ?? 0;
		// Far enough to cover the furthest corner, with room for the soft edge (the gradient fades over its outer 30%).
		const reach = Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) * 2.9;
		const at = (size: number) => ({ maskSize: `${size}px ${size}px`, maskPosition: `${x - size / 2}px ${y - size / 2}px` });
		page.animate([at(0), at(reach)], {
			duration: 800,
			easing: "cubic-bezier(0.45, 0, 0.2, 1)",
			// Hold the full size until the transition ends; otherwise the mask drops back to 0 for a
			// frame or two first, and the old theme flashes through.
			fill: "forwards",
			pseudoElement: "::view-transition-new(root)",
		});
	});
}

/** The middle of the element a click came from, where the circle grows from. */
const centreOf = (event?: React.MouseEvent<HTMLElement>) => {
	const box = event?.currentTarget.getBoundingClientRect();
	return box && { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

function useThemeSwitch() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const dark = mounted && resolvedTheme === "dark";
	return {
		mounted,
		dark,
		following: !mounted || theme === "system",
		flip: (event?: React.MouseEvent<HTMLElement>) => {
			const next = dark ? "light" : "dark";
			play(next === "dark" ? "off" : "on");
			changeTheme(next, () => setTheme(next), centreOf(event));
		},
		follow: (event?: React.MouseEvent<HTMLElement>) => {
			const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
			changeTheme(system, () => setTheme("system"), centreOf(event));
		},
	};
}

const spring = { type: "spring", stiffness: 500, damping: 32 } as const;

/** Shown only once a choice overrides the system: one click goes back to following it. */
function Auto({ show, onClick }: { show: boolean; onClick: () => void }) {
	if (!show) return null;
	return (
		<button
			type="button"
			onClick={onClick}
			title="Follow the system theme again"
			className={`${mono} text-xs uppercase tracking-wider text-[var(--dim)] underline decoration-dotted underline-offset-4 hover:text-[var(--ink)]`}
		>
			Auto
		</button>
	);
}

/** A sun; going dark, a second disc slides across it to leave a crescent, and the rays draw in. */
export function EclipseSwitch() {
	const { mounted, dark, following, flip, follow } = useThemeSwitch();
	const rays = [0, 45, 90, 135, 180, 225, 270, 315];
	const mask = useId();

	// The disc that eclipses the sun sits off to the top right in light, and over the sun in dark.
	const shadow = { light: { cx: 21, cy: 3 }, dark: { cx: 16, cy: 8 } };
	const sun = { light: 5, dark: 8 };

	return (
		<span className="flex items-center gap-3">
			<Auto show={!following} onClick={follow} />
			<button
				type="button"
				role="switch"
				aria-checked={dark}
				aria-label="Dark mode"
				data-sfx="none"
				onClick={flip}
				className="flex size-9 items-center justify-center border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--soft)]"
			>
				<svg viewBox="0 0 24 24" className="size-6" aria-hidden>
					<mask id={mask}>
						<rect width="24" height="24" fill="white" />
						{mounted ? (
							<motion.circle
								r="7"
								fill="black"
								initial={false}
								animate={dark ? shadow.dark : shadow.light}
								transition={spring}
							/>
						) : (
							<>
								<circle r="7" fill="black" {...shadow.light} className="dark:hidden" />
								<circle r="7" fill="black" {...shadow.dark} className="hidden dark:block" />
							</>
						)}
					</mask>
					{mounted ? (
						<motion.circle cx="12" cy="12" fill="currentColor" mask={`url(#${mask})`} initial={false} animate={{ r: dark ? sun.dark : sun.light }} transition={spring} />
					) : (
						<>
							<circle cx="12" cy="12" r={sun.light} fill="currentColor" mask={`url(#${mask})`} className="dark:hidden" />
							<circle cx="12" cy="12" r={sun.dark} fill="currentColor" mask={`url(#${mask})`} className="hidden dark:block" />
						</>
					)}
					{/* Each ray is placed by a static rotation, then only shrinks along its own length. */}
					<g stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" className={mounted ? "" : "dark:hidden"}>
						{rays.map((angle) => (
							<g key={angle} transform={`rotate(${angle} 12 12)`}>
								{mounted ? (
									<motion.path
										d="M12 1.5V4"
										initial={false}
										animate={dark ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
										transition={{ duration: 0.25, delay: dark ? 0 : 0.12 }}
									/>
								) : (
									<path d="M12 1.5V4" />
								)}
							</g>
						))}
					</g>
				</svg>
			</button>
		</span>
	);
}
