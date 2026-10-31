import geometry from "./cabinet-geometry.json";
import { layout } from "./layout";

/**
 * Where the camera can be taken: a few viewpoints set by hand, as on Jesse
 * Zhou's ramen shop. Clicking a thing flies the camera there; once it lands
 * you can look about a little, inside that view's limits. Plain numbers, no
 * three.js, so the page around the canvas can import them.
 */

type Triple = [number, number, number];

export type ViewKey = "wide" | "cabinet" | "tv" | "records" | "sky";

export type View = {
	/** What the view is of, for the caption and the Back button. */
	label: string;
	position: Triple;
	target: Triple;
	/** How far you can swing round from where the view puts you (radians each way); null for all the way. */
	swing: number | null;
	/** Up-and-down limits: 0 looks straight down, π/2 is level. */
	polar: [number, number];
	/** How near and far the scroll wheel goes. */
	distance: [number, number];
	/** How far to slide sideways (metres) when the machine's panel covers the right of the screen. */
	shift?: number;
};

/** Where the corners stand: a position on the floor and a turn about the vertical. */
export const anchors = { tv: layout.tv, records: layout.records };
/** The TV's stand, and the picture on its screen in the corner's own frame. */
export const stand = { w: 0.95, h: 0.42, d: 0.5 };
export const tvScreen: Triple = [-0.17, stand.h + 0.194, 0.215];
/** Height of the turntable's platter. */
const deck = 0.6;

/** A point in a corner's frame (which is grown by its scale), placed in the world. */
function place({ at, turn, scale }: { at: Triple; turn: number; scale: number }, [x, y, z]: Triple): Triple {
	const [c, s] = [Math.cos(turn), Math.sin(turn)];
	[x, y, z] = [x * scale, y * scale, z * scale];
	return [at[0] + x * c + z * s, at[1] + y, at[2] - x * s + z * c];
}

/** Out in front of a corner, `out` metres along its facing and `up` metres higher (both grown with it). */
function before(anchor: { at: Triple; turn: number; scale: number }, target: Triple, out: number, up: number): Triple {
	[out, up] = [out * anchor.scale, up * anchor.scale];
	return [target[0] + Math.sin(anchor.turn) * out, target[1] + up, target[2] + Math.cos(anchor.turn) * out];
}

const tvTarget = place(anchors.tv, tvScreen);
const recordsTarget = place(anchors.records, [0, deck, 0]);

/** The cabinet's screen, seen square-on but a little less steeply than its own tilt. */
const glass = geometry.screen.centre as Triple;
const tilt = Math.hypot(geometry.screen.normal[1], geometry.screen.normal[2]);
const facing: Triple = [0, (geometry.screen.normal[1] / tilt) * 0.62, geometry.screen.normal[2] / tilt];
const reach = 1.95 / Math.hypot(...facing);

export const views: Record<ViewKey, View> = {
	wide: { label: "The arcade", position: layout.wide.position, target: layout.wide.target, swing: null, polar: [0.9, 1.5], distance: [3.2, 6] },
	cabinet: {
		label: "The cabinet",
		position: [glass[0] + facing[0] * reach, glass[1] + facing[1] * reach, glass[2] + facing[2] * reach],
		target: glass,
		swing: 0.35,
		polar: [0.95, 1.45],
		distance: [1.2, 2.6],
		shift: 0.25,
	},
	tv: { label: "The TV", position: before(anchors.tv, tvTarget, 0.85, 0.12), target: tvTarget, swing: 0.4, polar: [1.0, 1.55], distance: [0.5, 1.1] },
	records: { label: "The records", position: before(anchors.records, recordsTarget, 0.8, 0.55), target: recordsTarget, swing: 0.4, polar: [0.5, 1.25], distance: [0.6, 1.3] },
	// Low in front of the cabinet, looking up over it: for the wishes that happen in the sky.
	sky: { label: "The sky", position: [0.55, 1.5, 4.6], target: [1.2, 5.5, -16], swing: 0.6, polar: [1.6, 2.1], distance: [18, 24] },
};

/** The neon pair behind the cabinet, either side of the hologram: same height, same size, mirrored. */
export const neonPair = { x: 1.05, y: 2.0, z: -1.38, size: 0.6 };
/** Turned to face the wide view, so neither reads as skewed. */
export const facingWide = (x: number, z: number) => Math.atan2(views.wide.position[0] - x, views.wide.position[2] - z);

/** What each thing in the scene takes you to, and what hovering it says. */
export const hints: Record<Exclude<ViewKey, "wide">, string> = { cabinet: "Play", tv: "Watch TV", records: "Records", sky: "Look up" };

/** A click that ends a drag isn't a click: anything over a few pixels of movement is ignored. */
export const isTap = (event: { delta: number }) => event.delta <= 5;
