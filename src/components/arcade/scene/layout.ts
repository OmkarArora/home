/**
 * Where everything stands round the cabinet (which is always at the middle, facing you). Plain
 * numbers, no three.js, so the page around the canvas can import them. x runs right, z towards the
 * wide view; metres.
 */

type Triple = [number, number, number];
type Spot = [number, number];
/** A position on the floor and a turn about the vertical. */
type Anchor = { at: Triple; turn: number };
/** A corner, everything in it (furniture and models) grown by `scale`. */
type Corner = Anchor & { scale: number };

/** The TV and the records a quarter bigger than life: true to size, they read as toys beside the cabinet. */
const grow = 1.25;

export const layout: {
	tv: Corner;
	records: Corner;
	/** The dragon balls' pedestal. */
	pedestal: Spot;
	/** The chalkboard sign. */
	sandwich: Anchor;
	/** The sakura: the foot of its trunk, and how tall it is (m). */
	tree: { foot: Spot; height: number };
	/** The ゲーセン sign's pole. */
	sign: Spot;
	/** The two pools of neon on the floor: the TV's side, then the records'. */
	pools: [Spot, Spot];
	/** The wide view. */
	wide: { position: Triple; target: Triple };
} = {
	// Left, the sakura with the dragon's pedestal under it, near the trunk, and the TV just inside it;
	// right, the records under the sign; the board out front.
	tv: { at: [-1.05, 0, -1.0], turn: 0.45, scale: grow },
	records: { at: [1.45, 0, -0.9], turn: -0.55, scale: grow },
	pedestal: [-1.55, 0.2],
	sandwich: { at: [0.86, 0, 0.4], turn: -0.5 },
	tree: { foot: [-2.1, -0.45], height: 3.4 },
	sign: [1.85, -1.75],
	pools: [
		[-1.9, 0.4],
		[2.0, 0.2],
	],
	wide: { position: [0.55, 2.35, 5.0], target: [-0.35, 1.08, 0] },
};
