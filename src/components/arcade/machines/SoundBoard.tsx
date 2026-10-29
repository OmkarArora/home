"use client";

import { useRef, useState } from "react";

import { type Sfx, type VoiceName, playNotes, siteVoice, sounds, stepNote, voices } from "@/components/site/sound";
import { mono } from "@/components/site/ui";

import { Choice, Knobs, type MachineProps, Screen, stack, useButtons, useGameStart } from "./kit";

/**
 * The site's sound effects as an instrument: a pad for each sound, and a strip
 * of keys that climb a pentatonic scale as the pointer sweeps across (the
 * About list's hover run). Every sound is made on the spot with Web Audio, no
 * files. Plays when pressed, whether or not the site's sound is on. On the
 * cabinet, its coloured buttons play the pads too.
 */

const names = Object.keys(sounds) as Sfx[];
const voiceNames = Object.keys(voices) as VoiceName[];

export function SoundBoard({ compact = false, layout = stack }: MachineProps) {
	const [voice, setVoice] = useState<VoiceName>(siteVoice);
	const [lit, setLit] = useState<string | null>(null);
	const flash = (key: string) => {
		setLit(key);
		setTimeout(() => setLit((now) => (now === key ? null : now)), 160);
	};
	const pad = (name: Sfx) => {
		playNotes(voice, sounds[name]);
		flash(name);
	};
	// A game starts: every pad lights in turn, to a rising jingle.
	useGameStart(() => {
		names.forEach((name, i) => setTimeout(() => flash(name), i * 70));
		[0, 4, 7, 12, 16, 19, 24].forEach((step, i) => setTimeout(() => playNotes(voice, [[523.25 * 2 ** (step / 12), 0, 0.09]]), i * 90));
	});
	// On a cabinet, its twelve buttons are the pads, and the last climbs the run.
	const step = useRef(0);
	useButtons([
		...names.map((name) => ({ label: name, press: () => pad(name) })),
		{
			label: "run",
			press: () => {
				stepNote(undefined, voice, true);
				flash(`key${step.current++ % 8}`);
			},
		},
	]);

	return layout(
		<Screen className={`${mono} flex aspect-[4/3] flex-col gap-3 p-4 text-xs uppercase tracking-wider`}>
			<div className="grid flex-1 grid-cols-4 gap-2">
				{names.map((name) => (
					<button
						key={name}
						type="button"
						data-sfx="none"
						disabled={compact}
						onClick={() => pad(name)}
						className={`flex items-end border p-2 font-bold transition-colors duration-150 ${lit === name ? "border-[var(--ink)] bg-[var(--lime)] text-[#0c0c0d]" : "border-[var(--line)] hover:border-[var(--ink)]"}`}
					>
						{name}
					</button>
				))}
			</div>
			{/* Sweep across: each key plays the next note up; pause and it starts over. */}
			<div className="grid h-1/3 grid-cols-8 gap-1" aria-label="Sweep the pointer across to play a rising run">
				{Array.from({ length: 8 }, (_, i) => (
					<div
						key={i}
						onPointerEnter={() => {
							if (compact) return;
							stepNote(undefined, voice, true);
							flash(`key${i}`);
						}}
						className={`border transition-colors duration-150 ${lit === `key${i}` ? "border-[var(--ink)] bg-[var(--lime)]" : "border-[var(--line)]"}`}
					/>
				))}
			</div>
		</Screen>,
		compact ? null : (
			<Knobs>
				<div className="sm:col-span-2">
					<Choice
						label="Voice"
						value={voice}
						options={voiceNames.map((name) => ({ value: name, label: voices[name].label }))}
						onChange={setVoice}
					/>
					<p className="mt-2 normal-case tracking-normal text-[var(--dim)]">{voices[voice].note}</p>
				</div>
			</Knobs>
		),
	);
}
