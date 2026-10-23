"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

import { mono } from "./ui";

/**
 * The light/dark switch in version A's top bar:
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
function useThemeSwitch() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const dark = mounted && resolvedTheme === "dark";
	return {
		mounted,
		dark,
		following: !mounted || theme === "system",
		flip: () => setTheme(dark ? "light" : "dark"),
		follow: () => setTheme("system"),
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
