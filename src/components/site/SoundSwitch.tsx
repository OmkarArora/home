"use client";

import { useEffect, useState } from "react";

import { listenForClicks, setSoundOn, useSoundOn } from "./sound";

/**
 * The speaker in the top bar: sound effects on or off. Off by default. It also
 * starts the page-wide click listener that plays them.
 */
export function SoundSwitch() {
	const on = useSoundOn();
	// The saved choice lives in this browser only; until hydration, show it off.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	useEffect(() => listenForClicks(), []);

	const shown = mounted && on;
	return (
		<button
			type="button"
			role="switch"
			aria-checked={shown}
			aria-label="Sound effects"
			title={shown ? "Sound on" : "Sound off"}
			data-sfx="none"
			onClick={() => setSoundOn(!on)}
			className="flex size-9 items-center justify-center border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--soft)]"
		>
			<svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
				<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
				{shown ? (
					<>
						<path d="M16.5 9.5a3.5 3.5 0 0 1 0 5" />
						<path d="M19 7a7 7 0 0 1 0 10" />
					</>
				) : (
					<path d="M17 10l4 4m0-4l-4 4" />
				)}
			</svg>
		</button>
	);
}
