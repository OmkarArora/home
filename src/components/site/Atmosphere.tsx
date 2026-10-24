"use client";

import { useEffect, useRef } from "react";

/**
 * Two layers drifting behind the whole site, on one canvas that never takes a
 * click:
 *
 * - dust: a few hundred faint specks, there mostly so the cursor has something
 *   to move through;
 * - fireflies: a few soft glowing dots that wander and pulse. Lime on dark; on
 *   the light theme a deep olive core inside the lime glow, so they show on paper.
 *
 * The mouse parts both like water and a damped spring settles them back. They
 * pause in a hidden tab, thin out on small screens, change with the theme, and
 * don't run at all under reduced motion.
 */

type Mote = {
	x: number;
	y: number;
	r: number;
	alpha: number;
	vx: number;
	vy: number;
	/** Phase, for the fireflies' pulse. */
	t: number;
	/** How far the cursor has pushed it from where it would be, and how fast that's changing. */
	ox: number;
	oy: number;
	ovx: number;
	ovy: number;
};

/** The cursor pushes motes out of a circle this wide, hardest at its centre. */
const reach = 140;
/** A spring draws a pushed mote back: how stiff, and how much it's damped (no wobble). */
const stiffness = 9;
const damping = 3.6;
const push = 5200;

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

/** The cursor's push and the spring back. Returns where to draw the mote. */
function nudge(m: Mote, dt: number, pointer: { x: number; y: number }): [number, number] {
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

export function Atmosphere() {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const el = canvas.current;
		if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = el.getContext("2d");
		if (!ctx) return;

		let w = 0;
		let h = 0;
		let dust: Mote[] = [];
		let flies: Mote[] = [];
		const site = el.closest<HTMLElement>("[data-site]") ?? document.documentElement;
		let core = "#c6f03a";
		let glow = "#c6f03a";
		let ink = "#0c0c0d";
		const readColours = () => {
			const style = getComputedStyle(site);
			const dark = document.documentElement.classList.contains("dark");
			glow = style.getPropertyValue("--lime").trim() || glow;
			// --accent-ink is the deep olive on light, lime on dark.
			core = dark ? glow : style.getPropertyValue("--accent-ink").trim() || "#3f6212";
			ink = style.getPropertyValue("--ink").trim() || ink;
		};

		const seed = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = window.innerWidth;
			h = window.innerHeight;
			el.width = w * dpr;
			el.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const megapixels = (w * h) / 1_000_000;
			dust = Array.from({ length: Math.round(40 + megapixels * 160) }, () => mote(w, h, [0.9, 1.6], [0.25, 0.55], 3));
			flies = Array.from({ length: Math.round(8 + megapixels * 8) }, () => mote(w, h, [1.2, 1.6], [0.45, 0.85], 8));
		};

		// Where the mouse is (the canvas is fixed to the screen, so client coordinates do). Touch has no hover.
		const pointer = { x: -1e6, y: -1e6 };
		const onMove = (event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			pointer.x = event.clientX;
			pointer.y = event.clientY;
		};
		const onLeave = () => {
			pointer.x = pointer.y = -1e6;
		};

		readColours();
		seed();

		let frame = 0;
		let last = performance.now();
		const draw = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			ctx.clearRect(0, 0, w, h);

			// Dust: tiny squares, no glow, so a few hundred cost almost nothing.
			ctx.shadowBlur = 0;
			ctx.fillStyle = ink;
			for (const d of dust) {
				wander(d, dt, 3, 4, w, h);
				const [x, y] = nudge(d, dt, pointer);
				ctx.globalAlpha = d.alpha;
				ctx.fillRect(x - d.r / 2, y - d.r / 2, d.r, d.r);
			}

			// Fireflies: round, glowing, pulsing.
			ctx.fillStyle = core;
			ctx.shadowColor = glow;
			ctx.shadowBlur = 10;
			for (const f of flies) {
				f.t += dt;
				wander(f, dt, 12, 14, w, h);
				const [x, y] = nudge(f, dt, pointer);
				ctx.globalAlpha = f.alpha * (0.55 + 0.45 * Math.sin(f.t * 1.3));
				ctx.beginPath();
				ctx.arc(x, y, f.r, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
			frame = requestAnimationFrame(draw);
		};

		const start = () => {
			cancelAnimationFrame(frame);
			last = performance.now();
			frame = requestAnimationFrame(draw);
		};
		const onVisibility = () => (document.hidden ? cancelAnimationFrame(frame) : start());
		// The theme is a class on <html>; recolour when it changes.
		const themeWatch = new MutationObserver(readColours);
		themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

		start();
		window.addEventListener("pointermove", onMove, { passive: true });
		document.documentElement.addEventListener("pointerleave", onLeave);
		window.addEventListener("resize", seed);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelAnimationFrame(frame);
			themeWatch.disconnect();
			window.removeEventListener("pointermove", onMove);
			document.documentElement.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("resize", seed);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);

	return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 size-full" />;
}
