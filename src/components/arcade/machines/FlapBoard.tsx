"use client";

import { useState } from "react";

import { RotatingWord } from "@/components/site/RotatingWord";
import { mono } from "@/components/site/ui";

import { Knob, Knobs, type MachineProps, Screen, stack, useButtons, useGameStart } from "./kit";

/**
 * The home headline's rotating word, with your own words: each letter flips
 * in after the one before, like a departure board, and the lime block eases
 * to the new word's width. Same component as the home page.
 */

const start = ["magical", "instant", "effortless", "solid", "alive"];

/** Up to six words of up to twelve letters, from what's typed. */
const wordsOf = (text: string) =>
	text
		.split(",")
		.map((word) => word.trim().slice(0, 12))
		.filter(Boolean)
		.slice(0, 6);

export function FlapBoard({ compact = false, layout = stack }: MachineProps) {
	const [text, setText] = useState(start.join(", "));
	const [every, setEvery] = useState(2800);
	const [stagger, setStagger] = useState(45);
	const words = wordsOf(text);
	// A game starts: the board flips to PLAYER 1, then back to your words.
	const [ready, setReady] = useState(false);
	useGameStart(() => {
		setReady(true);
		setTimeout(() => setReady(false), 2600);
	});
	const yours = words.length > 1 ? words : start;
	const shown = ready ? ["player 1", ...yours] : yours;
	// On a cabinet, each player's buttons flip straight to word 1–6.
	const [pick, setPick] = useState<{ index: number; n: number }>();
	const flipTo = (index: number) => setPick((p) => ({ index, n: (p?.n ?? 0) + 1 }));
	useButtons(Array.from({ length: 12 }, (_, i) => (shown[i % 6] ? { label: shown[i % 6], press: () => flipTo(i % 6) } : null)));

	return layout(
		// Sized to the screen it's on, not the window: a twelve-letter word still fits a cabinet's small CRT.
		<Screen className="flex aspect-[4/3] items-center justify-center p-6 [container-type:inline-size]">
			<p className="text-center text-[clamp(1rem,9cqw,3.5rem)] leading-[1.2] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
				<span className="sr-only">Web that feels {shown[0]}</span>
				<span aria-hidden>Web that feels </span>
				{/* A new set of words starts the board over. */}
				<RotatingWord key={shown.join()} words={shown} every={every} stagger={stagger / 1000} pick={pick} />
			</p>
		</Screen>,
		compact ? null : (
			<Knobs>
				<label className="grid gap-1 sm:col-span-2">
					<span className="text-[var(--dim)]">Words, comma separated (up to six)</span>
					<input
						value={text}
						onChange={(event) => setText(event.target.value)}
						maxLength={90}
						className={`${mono} border border-[var(--line)] bg-transparent px-2 py-1.5 normal-case tracking-normal focus:border-[var(--ink)] focus:outline-none`}
					/>
				</label>
				<Knob label="Each word stays" value={every} min={800} max={6000} step={100} unit="ms" onChange={setEvery} />
				<Knob label="Letter stagger" value={stagger} min={0} max={150} step={5} unit="ms" onChange={setStagger} />
			</Knobs>
		),
	);
}
