import { Bloom } from "./Bloom";
import { Fireflies } from "./Fireflies";
import { FlapBoard } from "./FlapBoard";
import type { MachineProps } from "./kit";
import { PolaroidShuffle } from "./PolaroidShuffle";
import { SoundBoard } from "./SoundBoard";

/**
 * The Arcade's machines: each one is a trick this site uses, made playable.
 * `how` is the one-line explanation shown beside it.
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
		key: "fireflies",
		name: "Fireflies",
		tag: "Particles that part",
		how: "Move through them. Each speck is pushed out of a circle around the pointer, and a damped spring draws it back to where it was drifting.",
		Play: Fireflies,
	},
	{
		key: "bloom",
		name: "Bloom",
		tag: "The theme switch",
		how: "Click anywhere. The other theme grows out of that point under a radial-gradient mask, so its edge stays soft instead of the hard line a clip-path draws.",
		Play: Bloom,
	},
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
