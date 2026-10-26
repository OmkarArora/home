/**
 * The site's particles, shared by the background (`Atmosphere`) and the
 * Arcade's Fireflies machine:
 *
 * - dust: faint specks, there mostly so the cursor has something to move through;
 * - fireflies: soft glowing dots that wander and pulse.
 *
 * The pointer parts both like water and a damped spring settles them back.
 */

export type Mote = {
	x: number;
	y: number;
	r: number;
	alpha: number;
	vx: number;
	vy: number;
	/** Phase, for the fireflies' pulse. */
	t: number;
	/** How far the pointer has pushed it from where it would be, and how fast that's changing. */
	ox: number;
	oy: number;
	ovx: number;
	ovy: number;
};

export type Physics = {
	/** The pointer pushes motes out of a circle this wide, hardest at its centre. */
	reach: number;
	push: number;
	/** A spring draws a pushed mote back: how stiff, and how much it's damped (no wobble). */
	stiffness: number;
	damping: number;
};

export const sitePhysics: Physics = { reach: 140, push: 5200, stiffness: 9, damping: 3.6 };

/** How many motes per megapixel, on top of a few always there, and how big. */
export type Density = { dust: number; flies: number; size: number };

export const siteDensity: Density = { dust: 160, flies: 8, size: 1 };

export type Field = { dust: Mote[]; flies: Mote[] };

export type Colours = { core: string; glow: string; ink: string };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function mote(w: number, h: number, r: [number, number], alpha: [number, number], speed: number): Mote {
	return {
		x: rand(0, w),
		y: rand(0, h),
		r: rand(...r),
		alpha: rand(...alpha),
		vx: rand(-speed, speed),
		vy: rand(-speed, speed),
		t: rand(0, Math.PI * 2),
		ox: 0,
		oy: 0,
		ovx: 0,
		ovy: 0,
	};
}

/**
 * Fill a `w`×`h` field. Motes already there are kept (a phone's address bar
 * resizes the page as you scroll); only a few are added or dropped to match.
 */
export function seed(field: Field, w: number, h: number, density: Density = siteDensity): Field {
	const megapixels = (w * h) / 1_000_000;
	const fit = (motes: Mote[], count: number, make: () => Mote) =>
		motes.slice(0, count).concat(Array.from({ length: Math.max(0, count - motes.length) }, make));
	const s = density.size;
	return {
		dust: fit(field.dust, Math.round(40 + megapixels * density.dust), () => mote(w, h, [0.9 * s, 1.6 * s], [0.25, 0.55], 3)),
		flies: fit(field.flies, Math.round(8 + megapixels * density.flies), () => mote(w, h, [1.2 * s, 1.6 * s], [0.45, 0.85], 8)),
	};
}

/** Drift, turning a little at a time, and wrap at the edges. */
function wander(m: Mote, dt: number, speed: number, turn: number, w: number, h: number) {
	m.vx = Math.max(-speed, Math.min(speed, m.vx + rand(-turn, turn) * dt));
	m.vy = Math.max(-speed, Math.min(speed, m.vy + rand(-turn, turn) * dt));
	m.x += m.vx * dt;
	m.y += m.vy * dt;
	if (m.x < -10) m.x = w + 10;
	if (m.x > w + 10) m.x = -10;
	if (m.y < -10) m.y = h + 10;
	if (m.y > h + 10) m.y = -10;
}

/** The pointer's push and the spring back. Returns where to draw the mote. */
function nudge(m: Mote, dt: number, pointer: { x: number; y: number }, physics: Physics): [number, number] {
	const { reach, push, stiffness, damping } = physics;
	let ax = -stiffness * m.ox - damping * m.ovx;
	let ay = -stiffness * m.oy - damping * m.ovy;
	const px = m.x + m.ox;
	const py = m.y + m.oy;
	const dx = px - pointer.x;
	const dy = py - pointer.y;
	const d2 = dx * dx + dy * dy;
	if (d2 < reach * reach) {
		const d = Math.max(6, Math.sqrt(d2));
		const fall = 1 - d / reach;
		ax += (dx / d) * push * fall * fall;
		ay += (dy / d) * push * fall * fall;
	}
	m.ovx += ax * dt;
	m.ovy += ay * dt;
	m.ox += m.ovx * dt;
	m.oy += m.ovy * dt;
	return [px, py];
}

/** Move every mote on by `dt` seconds and draw the frame. */
export function step(
	ctx: CanvasRenderingContext2D,
	field: Field,
	dt: number,
	size: { w: number; h: number },
	pointer: { x: number; y: number },
	colours: Colours,
	physics: Physics = sitePhysics,
	show: { dust: boolean; flies: boolean } = { dust: true, flies: true },
) {
	const { w, h } = size;
	ctx.clearRect(0, 0, w, h);

	// Dust: tiny squares, no glow, so a few hundred cost almost nothing.
	if (show.dust) {
		ctx.shadowBlur = 0;
		ctx.fillStyle = colours.ink;
		for (const d of field.dust) {
			wander(d, dt, 3, 4, w, h);
			const [x, y] = nudge(d, dt, pointer, physics);
			ctx.globalAlpha = d.alpha;
			ctx.fillRect(x - d.r / 2, y - d.r / 2, d.r, d.r);
		}
	}

	// Fireflies: round, glowing, pulsing.
	if (show.flies) {
		ctx.fillStyle = colours.core;
		ctx.shadowColor = colours.glow;
		ctx.shadowBlur = 10;
		for (const f of field.flies) {
			f.t += dt;
			wander(f, dt, 12, 14, w, h);
			const [x, y] = nudge(f, dt, pointer, physics);
			ctx.globalAlpha = f.alpha * (0.55 + 0.45 * Math.sin(f.t * 1.3));
			ctx.beginPath();
			ctx.arc(x, y, f.r, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	ctx.globalAlpha = 1;
}

/** Lime on dark; on light a deep olive core inside the lime glow, so they show on paper. */
export function readColours(site: Element, fallback: Colours = { core: "#3f6212", glow: "#c6f03a", ink: "#0c0c0d" }): Colours {
	const style = getComputedStyle(site);
	const glow = style.getPropertyValue("--lime").trim() || fallback.glow;
	// --accent-ink is the deep olive on light, lime on dark (and inside the Arcade's always-dark screens).
	const core = style.getPropertyValue("--accent-ink").trim() || fallback.core;
	return { core, glow, ink: style.getPropertyValue("--ink").trim() || fallback.ink };
}
