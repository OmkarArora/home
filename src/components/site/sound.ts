"use client";

import { useSyncExternalStore } from "react";

/**
 * The site's sound effects: tiny 8-bit blips made on the spot with the Web
 * Audio API, so there are no audio files to download.
 *
 * Off until the visitor turns them on (the speaker in the top bar); the choice
 * is remembered in this browser. Sounds only ever follow something the visitor
 * did: a click, a drag, the switch. Nothing plays on its own.
 */

export type Sfx = "click" | "on" | "off" | "chime" | "open" | "close" | "flip";

/** Each sound as notes: [frequency in Hz, start in s, length in s]. */
const sounds: Record<Sfx, Array<[number, number, number]>> = {
	click: [[1320, 0, 0.03]],
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
};

const key = "sfx";
const listeners = new Set<() => void>();
let audio: AudioContext | null = null;

function read() {
	try {
		return localStorage.getItem(key) === "on";
	} catch {
		return false;
	}
}

let enabled = typeof window !== "undefined" && read();

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

export function play(name: Sfx) {
	if (!enabled) return;
	audio ??= new AudioContext();
	// Browsers start audio suspended until a gesture; every call here follows one.
	if (audio.state === "suspended") void audio.resume();

	const now = audio.currentTime;
	for (const [frequency, start, length] of sounds[name]) {
		const tone = audio.createOscillator();
		const volume = audio.createGain();
		tone.type = "square";
		tone.frequency.value = frequency;
		// Quiet, with a fast fade so it ticks instead of beeping.
		volume.gain.setValueAtTime(0.0001, now + start);
		volume.gain.exponentialRampToValueAtTime(0.04, now + start + 0.005);
		volume.gain.exponentialRampToValueAtTime(0.0001, now + start + length);
		tone.connect(volume).connect(audio.destination);
		tone.start(now + start);
		tone.stop(now + start + length + 0.02);
	}
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
