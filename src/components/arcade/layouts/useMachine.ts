"use client";

import { useCallback, useEffect, useState } from "react";

import { machines } from "../machines";

/**
 * Which machine is picked, kept in the address's hash (`/arcade#bloom`) so a
 * machine can be linked to, and the back button and the pause menu's links
 * just work. `null` when none is picked.
 */
export function useMachine(fallback: number | null = 0) {
	const [index, setIndex] = useState<number | null>(fallback);

	const read = useCallback(() => {
		const at = machines.findIndex((m) => `#${m.key}` === window.location.hash);
		setIndex(at >= 0 ? at : fallback);
	}, [fallback]);

	useEffect(() => {
		read();
		window.addEventListener("hashchange", read);
		return () => window.removeEventListener("hashchange", read);
	}, [read]);

	const pick = useCallback((next: number | null) => {
		setIndex(next);
		const hash = next === null ? "" : `#${machines[next].key}`;
		window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
	}, []);

	return [index, pick] as const;
}

/** Arrow keys, unless the visitor is typing or turning a knob. */
export function isArrowForUs(event: KeyboardEvent) {
	const target = event.target as HTMLElement | null;
	if (target?.closest("input, textarea, select, [contenteditable='true']")) return false;
	return event.key === "ArrowLeft" || event.key === "ArrowRight";
}
