import { FlapBoard } from "./FlapBoard";
import type { MachineProps } from "./kit";
import { PolaroidShuffle } from "./PolaroidShuffle";
import { SoundBoard } from "./SoundBoard";

/**
 * The Arcade's machines: each one is a trick this site uses, made playable.
 * `how` is the one-line explanation shown beside it. (Fireflies and Bloom are
 * built too, but didn't earn a place on the cabinet.)
 */
export type Machine = {
	key: string;
	name: string;
	/** What it is, in a few words, for the marquee and lists. */
	tag: string;
	how: string;
	Play: (props: MachineProps) => React.ReactNode;
};

export const machines: Machine[] = [
	{
		key: "flap",
		name: "Flap board",
		tag: "The rotating word",
		how: "Type your own words. Each letter flips in after the one before, like a departure board, while the lime block eases to the new word's width.",
		Play: FlapBoard,
	},
	{
		key: "polaroids",
		name: "Polaroids",
		tag: "The home page stack",
		how: "Watch it shuffle, or drag the top card aside. Cards keep a fixed order in the page and stack by z-index, because moving one in the DOM cancels its animation.",
		Play: PolaroidShuffle,
	},
	{
		key: "sound",
		name: "Sound board",
		tag: "The 8-bit sound effects",
		how: "Press a pad, or sweep across the keys. No audio files: each sound is a few oscillator notes with a quick volume envelope, through a filter.",
		Play: SoundBoard,
	},
];
