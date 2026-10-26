"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { play } from "@/components/site/sound";

import { isArrowForUs, useMachine } from "./layouts/useMachine";
import { machines } from "./machines";
import { PauseMenu } from "./PauseMenu";

/** The control being pressed, so a cabinet (drawn or 3D) can show it moving. */
export type Pressed = "prev" | "next" | "start" | "coin" | null;

/**
 * Everything a cabinet does, whatever draws it: which machine is on (kept in
 * the hash), ◀ ▶ and the arrow keys to change it, START for the pause menu,
 * the coin slot, and which control is moving for a moment so it can be drawn
 * pressed. `menu` is the pause menu to render; `startRef` goes on the START
 * button focus returns to when the menu closes.
 */
export function useArcade() {
	const [index, pick] = useMachine(0);
	const [paused, setPaused] = useState(false);
	const [pressed, setPressed] = useState<Pressed>(null);
	const [tilt, setTilt] = useState<-1 | 0 | 1>(0);
	const at = index ?? 0;
	const machine = machines[at];

	// Show a control moving for a moment.
	const timer = useRef<number | undefined>(undefined);
	const press = useCallback((key: NonNullable<Pressed>, lean: -1 | 0 | 1 = 0, hold = 150) => {
		window.clearTimeout(timer.current);
		setPressed(key);
		setTilt(lean);
		timer.current = window.setTimeout(() => {
			setPressed(null);
			setTilt(0);
		}, hold);
	}, []);

	const move = useCallback(
		(by: 1 | -1) => {
			play("select");
			press(by === 1 ? "next" : "prev", by);
			pick((at + by + machines.length) % machines.length);
		},
		[at, pick, press],
	);
	const start = useCallback(() => {
		play("start");
		press("start");
		setPaused(true);
	}, [press]);
	const coin = useCallback(() => {
		play("coin");
		press("coin", 0, 400);
	}, [press]);

	// After the pause menu, focus goes back to START. Picking a machine can redraw the cabinet,
	// so the START to focus may be a new one: it takes focus as it mounts.
	const refocus = useRef(false);
	const picked = useRef(false);
	const startButton = useRef<HTMLButtonElement | null>(null);
	const startRef = useCallback((button: HTMLButtonElement | null) => {
		startButton.current = button;
		if (button && refocus.current) {
			refocus.current = false;
			button.focus();
		}
	}, []);
	const resume = useCallback(() => {
		setPaused(false);
		refocus.current = true;
		if (!picked.current) startRef(startButton.current);
		// A pick that doesn't redraw START (the 3D page's lives outside the machine) still gets focus back.
		else window.setTimeout(() => startButton.current?.isConnected && startRef(startButton.current), 250);
		picked.current = false;
	}, [startRef]);

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (paused || !isArrowForUs(event)) return;
			event.preventDefault();
			move(event.key === "ArrowRight" ? 1 : -1);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [move, paused]);

	const menu = (
		<PauseMenu
			open={paused}
			onClose={resume}
			onPick={(href) => {
				const next = machines.findIndex((m) => `#${m.key}` === href);
				picked.current = next !== at;
				pick(next);
			}}
			items={machines.map((m) => ({ href: `#${m.key}`, label: m.name }))}
			current={`#${machine.key}`}
		/>
	);

	return { at, machine, pressed, tilt, move, start, coin, startRef, menu, paused };
}
