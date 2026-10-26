"use client";

import { useState } from "react";

import { RotatingWord } from "@/components/site/RotatingWord";
import { mono } from "@/components/site/ui";

import { Knob, Knobs, type MachineProps, Screen, stack } from "./kit";

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
	const shown = words.length > 1 ? words : start;

	return layout(
		<Screen className="flex aspect-[4/3] items-center justify-center p-6">
			<p className="text-[clamp(1.75rem,6vw,3.5rem)] leading-[0.95] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
				<span className="sr-only">Web that feels {shown[0]}</span>
				<span aria-hidden>Web that feels </span>
				{/* A new set of words starts the board over. */}
				<RotatingWord key={shown.join()} words={shown} every={every} stagger={stagger / 1000} />
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
