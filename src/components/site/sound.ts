"use client";

import { useSyncExternalStore } from "react";

/**
 * The site's sound effects, made on the spot with the Web Audio API: no audio
 * files to download. Each sound is a few notes; a "voice" decides what a note
 * sounds like (an 8-bit blip, a soft wooden thunk, a key click…). The Sound
 * lab (components/arcade/SoundLab) plays them all side by side.
 *
 * Off until the visitor turns them on (the speaker in the top bar); the choice
 * is remembered in this browser. Sounds only ever follow something the visitor
 * did: a click, a drag, a hover. Nothing plays on its own.
 */

export type Sfx = "click" | "on" | "off" | "chime" | "open" | "close" | "flip" | "coin" | "select" | "start" | "glide";

/** A note: [frequency in Hz, start in s, length in s]. */
type Note = [number, number, number];

/** Each sound as notes, pitched for the 8-bit voice; other voices shift them. */
export const sounds: Record<Sfx, Note[]> = {
	// C5, in key with the rest (all C major); the Muted voice plays it an octave down, at C4.
	click: [[523.25, 0, 0.05]],
	on: [
		[660, 0, 0.05],
		[990, 0.05, 0.07],
	],
	off: [
		[990, 0, 0.05],
		[660, 0.05, 0.07],
	],
	chime: [
		[784, 0, 0.06],
		[1047, 0.06, 0.06],
		[1319, 0.12, 0.1],
	],
	open: [
		[523, 0, 0.04],
		[784, 0.04, 0.06],
	],
	close: [
		[784, 0, 0.04],
		[523, 0.04, 0.06],
	],
	flip: [
		[440, 0, 0.03],
		[880, 0.03, 0.04],
	],
	// The Arcade's. A coin: B5 up to E6, the classic two-note ding.
	coin: [
		[987.77, 0, 0.06],
		[1318.51, 0.06, 0.16],
	],
	select: [[783.99, 0, 0.04]],
	// Start: a C major arpeggio, C5 E5 G5 C6.
	start: [
		[523.25, 0, 0.06],
		[659.25, 0.06, 0.06],
		[783.99, 0.12, 0.06],
		[1046.5, 0.18, 0.14],
	],
	// The camera flying to a new view: a soft step up, G4 to C5.
	glide: [
		[392, 0, 0.07],
		[523.25, 0.07, 0.12],
	],
};

type Voice = {
	label: string;
	note: string;
	/** Draws one note into `out`. */
	play: (audio: AudioContext, out: AudioNode, frequency: number, at: number, length: number) => void;
};

/** A volume shape: up fast to `peak`, then down to silence by `end`. */
function envelope(audio: AudioContext, at: number, peak: number, end: number) {
	const gain = audio.createGain();
	gain.gain.setValueAtTime(0.0001, at);
	gain.gain.exponentialRampToValueAtTime(peak, at + 0.004);
	gain.gain.exponentialRampToValueAtTime(0.0001, end);
	return gain;
}

function tone(audio: AudioContext, type: OscillatorType, at: number, end: number) {
	const osc = audio.createOscillator();
	osc.type = type;
	osc.start(at);
	osc.stop(end + 0.02);
	return osc;
}

let noise: AudioBuffer | null = null;
function noiseBuffer(audio: AudioContext) {
	if (noise) return noise;
	noise = audio.createBuffer(1, audio.sampleRate * 0.05, audio.sampleRate);
	const data = noise.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	return noise;
}

export const voices = {
	bit: {
		label: "8-bit",
		note: "The original: square-wave blips, bright and high.",
		play(audio, out, f, at, length) {
			const end = at + length;
			const gain = envelope(audio, at, 0.04, end);
			const osc = tone(audio, "square", at, end);
			osc.frequency.value = f;
			osc.connect(gain).connect(out);
		},
	},
	thunk: {
		label: "Thunk",
		note: "Wooden: an octave down, a quick pitch drop on the hit, soft triangle wave.",
		play(audio, out, f, at, length) {
			const end = at + length + 0.07;
			const gain = envelope(audio, at, 0.22, end);
			const filter = audio.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 1800;
			const osc = tone(audio, "triangle", at, end);
			osc.frequency.setValueAtTime(f * 0.9, at);
			osc.frequency.exponentialRampToValueAtTime(f * 0.45, at + 0.05);
			osc.connect(filter).connect(gain).connect(out);
		},
	},
	pop: {
		label: "Pop",
		note: "Round and bubbly: a sine that bends down fast, like a bubble popping.",
		play(audio, out, f, at, length) {
			const end = at + length + 0.05;
			const gain = envelope(audio, at, 0.25, end);
			const osc = tone(audio, "sine", at, end);
			osc.frequency.setValueAtTime(f * 1.1, at);
			osc.frequency.exponentialRampToValueAtTime(f * 0.6, at + 0.03);
			osc.connect(gain).connect(out);
		},
	},
	key: {
		label: "Key",
		note: "A mechanical-keyboard tap: a filtered click of noise over a low body.",
		play(audio, out, f, at, length) {
			const end = at + length + 0.04;
			const click = audio.createBufferSource();
			click.buffer = noiseBuffer(audio);
			const band = audio.createBiquadFilter();
			band.type = "bandpass";
			band.frequency.value = 2600;
			band.Q.value = 1.2;
			click.connect(band).connect(envelope(audio, at, 0.16, at + 0.025)).connect(out);
			click.start(at);
			click.stop(at + 0.03);
			const body = tone(audio, "sine", at, end);
			body.frequency.setValueAtTime(f * 0.3, at);
			body.frequency.exponentialRampToValueAtTime(f * 0.2, at + 0.04);
			body.connect(envelope(audio, at, 0.2, end)).connect(out);
		},
	},
	muted: {
		label: "Muted 8-bit",
		note: "The 8-bit voice an octave down, through a low-pass filter: retro, without the tin.",
		play(audio, out, f, at, length) {
			const end = at + length + 0.03;
			const filter = audio.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 1100;
			const gain = envelope(audio, at, 0.1, end);
			const osc = tone(audio, "square", at, end);
			osc.frequency.value = f * 0.5;
			osc.connect(filter).connect(gain).connect(out);
		},
	},
} satisfies Record<string, Voice>;

export type VoiceName = keyof typeof voices;

/** The voice the site uses: Omkar picked Muted 8-bit (October 2026). */
export const siteVoice: VoiceName = "muted";

const key = "sfx";
const listeners = new Set<() => void>();
let audio: AudioContext | null = null;

/** Whether the visitor has ever switched sound off themselves (not just never turned it on). */
export function soundTurnedOff() {
	try {
		return localStorage.getItem(key) === "off";
	} catch {
		return false;
	}
}

function read() {
	try {
		return localStorage.getItem(key) === "on";
	} catch {
		return false;
	}
}

let enabled = typeof window !== "undefined" && read();

/** Whether sound is on, right now (for sounds made outside React, like the Arcade's). */
export const isSoundOn = () => enabled;

export function setSoundOn(on: boolean) {
	enabled = on;
	try {
		localStorage.setItem(key, on ? "on" : "off");
	} catch {
		// Private windows can refuse storage; sound still works for this visit.
	}
	listeners.forEach((listener) => listener());
	if (on) play("chime");
}

export function useSoundOn() {
	return useSyncExternalStore(
		(listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		() => enabled,
		() => false,
	);
}

function context() {
	if (!audio) {
		audio = new AudioContext();
		// Leave the tab and everything goes quiet; come back and it carries on where it was.
		let wasRunning = false;
		document.addEventListener("visibilitychange", () => {
			if (!audio) return;
			if (document.hidden) {
				wasRunning = audio.state === "running";
				if (wasRunning) void audio.suspend();
			} else if (wasRunning) void audio.resume();
		});
	}
	// Browsers start audio suspended until a gesture; every call here follows one.
	if (audio.state === "suspended") void audio.resume();
	return audio;
}

/** The site's one audio context, for anything else that makes sound (the Arcade's record player). */
export function audioContext() {
	return context();
}

/** Notes in a voice, now, whether or not sound is switched on (the lab uses this). */
export function playNotes(voice: VoiceName, notes: Note[]) {
	const ctx = context();
	const now = ctx.currentTime;
	for (const [f, start, length] of notes) voices[voice].play(ctx, ctx.destination, f, now + start, length);
}

/** A sound in the site's voice, if sound is on. */
export function play(name: Sfx) {
	if (enabled) playNotes(siteVoice, sounds[name]);
}

/**
 * A rising run for sweeping across a list: each call plays the next note up a
 * pentatonic scale (which never sounds sour, whatever the order), and a pause
 * of `rest` ms starts the run again from the bottom.
 */
const pentatonic = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
let step = 0;
let restTimer: ReturnType<typeof setTimeout> | undefined;
export function stepNote(notes: (f: number) => Note[] = (f) => [[f, 0, 0.05]], voice: VoiceName = siteVoice, force = false, rest = 450) {
	if (!enabled && !force) return;
	const f = 523.25 * 2 ** (pentatonic[Math.min(step, pentatonic.length - 1)] / 12);
	playNotes(voice, notes(f));
	step++;
	clearTimeout(restTimer);
	restTimer = setTimeout(() => (step = 0), rest);
}

/**
 * One listener for the whole page: a click on a link or button plays its
 * `data-sfx` sound, or a plain click. Elements that play their own sound (the
 * theme switch, the menu) set `data-sfx="none"`.
 */
export function listenForClicks() {
	const onClick = (event: MouseEvent) => {
		const target = (event.target as Element | null)?.closest<HTMLElement>("a, button, [role='switch']");
		if (!target) return;
		const name = target.dataset.sfx;
		if (name === "none") return;
		play((name as Sfx | undefined) ?? "click");
	};
	document.addEventListener("click", onClick, true);
	return () => document.removeEventListener("click", onClick, true);
}
