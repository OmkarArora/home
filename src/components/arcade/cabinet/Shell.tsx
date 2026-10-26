"use client";

import { pixel } from "../pixelFont";

/**
 * An arcade cabinet drawn as an SVG, with the live parts laid over it: the
 * machine plays on a CRT set into the bezel, and real buttons sit over the
 * drawn ones, so they work with a keyboard and screen readers. The artwork
 * (`art`) only draws; it's told which control is pressed so it can move.
 *
 * Every position is a share of the drawing's own size, so the overlay stays
 * on the artwork at any width.
 */

export type ArtState = {
	/** The joystick: tilted left (-1), right (1) or upright (0). */
	tilt: -1 | 0 | 1;
	/** The button being pressed, if any. */
	pressed: "prev" | "next" | "start" | "coin" | null;
	/** The machine's name, for the marquee's small print. */
	title: string;
};

/** A box in the artwork's coordinates. */
export type Box = { x: number; y: number; w: number; h: number };

export type Art = {
	/** The drawing's size (its viewBox). */
	width: number;
	height: number;
	screen: Box;
	hits: Record<"prev" | "next" | "start" | "coin", Box>;
	Draw: (state: ArtState) => React.ReactNode;
};

const place = (box: Box, art: Art): React.CSSProperties => ({
	left: `${(box.x / art.width) * 100}%`,
	top: `${(box.y / art.height) * 100}%`,
	width: `${(box.w / art.width) * 100}%`,
	height: `${(box.h / art.height) * 100}%`,
});

const labels = { prev: "Previous machine", next: "Next machine", start: "Pause: all machines", coin: "Insert coin" } as const;

export function Shell({
	art,
	state,
	screen,
	on,
	startRef,
}: {
	art: Art;
	state: ArtState;
	screen: React.ReactNode;
	on: Record<"prev" | "next" | "start" | "coin", () => void>;
	startRef?: React.Ref<HTMLButtonElement>;
}) {
	return (
		<div className={`${pixel.className} relative w-full select-none`} style={{ aspectRatio: `${art.width} / ${art.height}` }}>
			<svg viewBox={`0 0 ${art.width} ${art.height}`} className="absolute inset-0 size-full" aria-hidden>
				{art.Draw(state)}
			</svg>
			<div className="absolute" style={place(art.screen, art)}>
				{screen}
			</div>
			{(Object.keys(art.hits) as (keyof Art["hits"])[]).map((key) => (
				<button
					key={key}
					ref={key === "start" ? startRef : undefined}
					type="button"
					data-sfx="none"
					aria-label={labels[key]}
					onClick={on[key]}
					className="absolute rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#c6f03a]"
					style={place(art.hits[key], art)}
				/>
			))}
		</div>
	);
}
