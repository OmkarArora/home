"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * An old CRT tube for a machine to play on: bulging glass (rounded corners),
 * scanlines, a dark vignette at the edges, a faint glow, and a quick power-on
 * (a bright line that opens into the picture) whenever `channel` changes.
 *
 * Always dark inside, whatever the site's theme: the colour variables are set
 * to the dark theme's here, so the machines draw as they do on dark.
 */

/** The site's dark colours, which a machine's screen always plays in. */
export const darkTheme = {
	"--bg": "#0b0b0c",
	"--ink": "#ededE6",
	"--dim": "#8a8a84",
	"--line": "rgb(237 237 230 / 0.14)",
	"--card": "#121214",
	"--soft": "#1a1a1d",
	"--accent-ink": "#c6f03a",
	color: "#ededE6",
} as React.CSSProperties;

export function Crt({
	channel,
	children,
	className = "",
	corners = "9% / 12%",
}: {
	channel: string;
	children: React.ReactNode;
	className?: string;
	/** How round the tube's corners are (a CSS border-radius); a cabinet's opening may want less. */
	corners?: string;
}) {
	const reduced = useReducedMotion();
	return (
		<div
			style={{ ...darkTheme, borderRadius: corners }}
			className={`relative isolate overflow-hidden bg-[#0b0b0c] shadow-[0_0_24px_rgb(198_240_58/0.18),inset_0_0_0_2px_#000] ${className}`}
		>
			{/* The machine fills the tube, whatever height it asked for. */}
			<motion.div
				key={channel}
				className="absolute inset-0 [&>*]:!aspect-auto [&>*]:size-full [&>*]:!min-h-0"
				initial={reduced ? false : { scaleY: 0.01, scaleX: 0.6, filter: "brightness(4)" }}
				animate={{ scaleY: 1, scaleX: 1, filter: "brightness(1)" }}
				transition={{ duration: 0.32, ease: [0.2, 0.9, 0.2, 1] }}
			>
				{children}
			</motion.div>
			{/* Scanlines, the glass's vignette and a highlight; none of them take clicks. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-10"
				style={{ background: "repeating-linear-gradient(to bottom, transparent 0 2px, rgb(0 0 0 / 0.22) 2px 3px)" }}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
				style={{ boxShadow: "inset 0 0 40px 8px rgb(0 0 0 / 0.75)" }}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 z-10"
				style={{ background: "radial-gradient(ellipse at 30% 20%, rgb(255 255 255 / 0.07), transparent 45%)" }}
			/>
		</div>
	);
}
