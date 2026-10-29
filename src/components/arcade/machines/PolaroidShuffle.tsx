"use client";

import { useEffect, useRef, useState } from "react";

import { Polaroids } from "@/components/site/Polaroids";
import { snaps } from "@/content/snaps";

import { Choice, Knob, Knobs, type MachineProps, Screen, stack, useButtons, useGameStart } from "./kit";

/**
 * The home page's polaroid stack: it flicks through on its own, out one side
 * and back in under the rest. Drag the top card aside to throw it yourself.
 * Same component as the home page.
 */
export function PolaroidShuffle({ compact = false, layout = stack }: MachineProps) {
	const [every, setEvery] = useState(4000);
	const [sides, setSides] = useState<"alternate" | "right">("alternate");
	// On a cabinet: next card, previous card, pause or play; the rest flick on.
	const [command, setCommand] = useState<{ go: "next" | "back" | "pause"; n: number }>();
	const send = (go: "next" | "back" | "pause") => setCommand((c) => ({ go, n: (c?.n ?? 0) + 1 }));
	const buttons = [
		{ label: "next card", press: () => send("next") },
		{ label: "previous card", press: () => send("back") },
		{ label: "pause / play", press: () => send("pause") },
		{ label: "next card", press: () => send("next") },
		{ label: "next card", press: () => send("next") },
		{ label: "next card", press: () => send("next") },
	];
	useButtons([...buttons, ...buttons]);
	// A game starts: the stack deals three cards, quickly.
	useGameStart(() => [0, 350, 700].forEach((ms) => setTimeout(() => send("next"), ms)));

	// The stack is drawn at the home page's size (about 25rem tall with its tilt); a shorter
	// screen, like an arcade cabinet's, shrinks it to fit.
	const screen = useRef<HTMLDivElement>(null);
	const [fit, setFit] = useState(1);
	useEffect(() => {
		const el = screen.current;
		if (!el) return;
		const observer = new ResizeObserver(() => setFit(Math.min(1, el.clientHeight / 400)));
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return layout(
		<Screen ref={screen} className="flex min-h-[28rem] items-center justify-center overflow-hidden">
			<div style={{ scale: fit }}>
				<Polaroids snaps={Object.values(snaps)} every={every} alternate={sides === "alternate"} command={command} links={false} />
			</div>
		</Screen>,
		compact ? null : (
			<Knobs>
				<Knob label="Each card stays" value={every} min={1200} max={8000} step={100} unit="ms" onChange={setEvery} />
				<Choice
					label="Goes out"
					value={sides}
					options={[
						{ value: "alternate", label: "Right, then left" },
						{ value: "right", label: "Always right" },
					]}
					onChange={setSides}
				/>
			</Knobs>
		),
	);
}
