"use client";

import { createContext, useContext } from "react";

/**
 * The scene's colours. Not the site's lime-on-black: a night out, after
 * Jesse Zhou's ramen stall, with two neon colours pooling on a glossy floor
 * and arcade-coloured buttons. Two of them: Twilight (the default) and
 * Synthwave, switched from the corner and remembered in this browser
 * (`?palette=` picks one for a link). Lime stays on the marquee.
 */

export type Palette = {
	/** The night: background and fog. */
	sky: string;
	/** The floor's own colour, under its sheen and the pools. */
	floor: string;
	/** The two neon colours that pool on the floor: the TV's side, then the record player's. */
	pools: [string, string];
	/** The neon alien on the wall: its glow, and the bright core of the tube. */
	sign: [string, string];
	/** The pixel heart: glow, core. */
	heart: [string, string];
	/** The hologram's points. */
	hologram: string;
	/** Each player's six buttons, back row then front, and the stick balls. */
	buttons: [string, string, string, string, string, string];
	stick: string;
	/** The strip under the kick plate and its spill. */
	underglow: string;
	/** The key light from above. */
	key: string;
	/** The paper lanterns, alternating along the wire. */
	lanterns: [string, string];
	/** The sakura's blossom, mixed through the crown and the petals: deep, pale, rose (the deepest) and blush. */
	blossom: [string, string, string, string];
};

export const palettes = {
	twilight: {
		sky: "#0a0b1e",
		floor: "#14163a",
		pools: ["#8b5cf6", "#38d9c4"],
		sign: ["#ffb86b", "#fff1dc"],
		heart: ["#ff7ac6", "#ffe3f2"],
		hologram: "#7af0e0",
		buttons: ["#ff6b8a", "#6b9dff", "#ffd36b", "#5fe0a5", "#b48cff", "#ffb86b"],
		stick: "#ffb86b",
		underglow: "#8b5cf6",
		key: "#fff3e4",
		lanterns: ["#e0352b", "#f3e1bd"],
		blossom: ["#f28bb0", "#ffe3ee", "#d9497f", "#ffb8d0"],
	},
	synthwave: {
		sky: "#0d0618",
		floor: "#1a1030",
		pools: ["#ff3dcb", "#2de2e6"],
		sign: ["#ff4fd8", "#ffe1f7"],
		heart: ["#2de2e6", "#d8faff"],
		hologram: "#5ff6ff",
		buttons: ["#ff4d6d", "#3d8bff", "#ffd23d", "#3ddc84", "#b06bff", "#ff8a3d"],
		stick: "#ff4d6d",
		underglow: "#ff3dcb",
		key: "#ffe9f6",
		lanterns: ["#ff3dcb", "#2de2e6"],
		blossom: ["#ff5fc8", "#ffd6f4", "#c92e9e", "#ff9ce0"],
	},
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof palettes;

export const PaletteContext = createContext<Palette>(palettes.twilight);
export const usePalette = () => useContext(PaletteContext);

const isName = (name: string | null): name is PaletteName => name !== null && Object.hasOwn(palettes, name);
const key = "arcade-palette";

/** The palette to start with: the link's `?palette=`, else the one chosen before here, else Twilight. */
export function startPalette(): PaletteName {
	if (typeof window === "undefined") return "twilight";
	const asked = new URLSearchParams(window.location.search).get("palette");
	if (isName(asked)) return asked;
	try {
		const saved = localStorage.getItem(key);
		if (isName(saved)) return saved;
	} catch {}
	return "twilight";
}

/** Remembers the choice in this browser. */
export function savePalette(name: PaletteName) {
	try {
		localStorage.setItem(key, name);
	} catch {}
}
