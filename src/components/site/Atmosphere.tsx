"use client";

import { useEffect, useRef } from "react";

/**
 * Faint particles drifting behind the whole site, on one canvas that never
 * takes a click. Barely noticeable on purpose.
 *
 * Three kinds, compared with `?particles=dust|fireflies|stars` (dust by
 * default). They pause in a hidden tab, thin out on small screens, take the
 * theme's colours (and change with it), and don't run at all under reduced
 * motion.
 */

type Kind = "dust" | "fireflies" | "stars";

type Mote = {
	x: number;
	y: number;
	r: number;
	alpha: number;
	vx: number;
	vy: number;
	/** Phase, for sway, twinkle and pulse. */
	t: number;
	/** Stars: how far away (0 near, 1 far), for parallax. */
	depth: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function Atmosphere() {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const el = canvas.current;
		if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = el.getContext("2d");
		if (!ctx) return;

		const chosen = new URLSearchParams(window.location.search).get("particles");
		const kind: Kind = chosen === "fireflies" || chosen === "stars" ? chosen : "dust";

		let w = 0;
		let h = 0;
		let motes: Mote[] = [];
		const site = el.closest<HTMLElement>("[data-site]") ?? document.documentElement;
		let ink = "#0c0c0d";
		let lime = "#c6f03a";
		const readColours = () => {
			const style = getComputedStyle(site);
			ink = style.getPropertyValue("--ink").trim() || ink;
			lime = style.getPropertyValue("--lime").trim() || lime;
		};

		const seed = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = window.innerWidth;
			h = window.innerHeight;
			el.width = w * dpr;
			el.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const area = (w * h) / 1_000_000;
			const count = kind === "fireflies" ? Math.round(10 + area * 10) : Math.round(Math.min(120, 30 + area * 55));
			motes = Array.from({ length: count }, () => ({
				x: rand(0, w),
				y: rand(0, h),
				r: kind === "fireflies" ? rand(2, 3.2) : kind === "stars" ? rand(0.8, 1.9) : rand(0.9, 2.2),
				alpha: kind === "fireflies" ? rand(0.45, 0.85) : rand(0.25, 0.55),
				vx: kind === "fireflies" ? rand(-8, 8) : rand(-2, 2),
				vy: kind === "dust" ? rand(-9, -3) : kind === "fireflies" ? rand(-8, 8) : 0,
				t: rand(0, Math.PI * 2),
				depth: rand(0, 1),
			}));
		};

		readColours();
		seed();

		let frame = 0;
		let last = performance.now();
		const draw = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			ctx.clearRect(0, 0, w, h);
			const scroll = window.scrollY;

			for (const m of motes) {
				m.t += dt;
				let x = m.x;
				let y = m.y;
				let alpha = m.alpha;
				ctx.shadowBlur = 0;

				if (kind === "dust") {
					m.x += m.vx * dt;
					m.y += m.vy * dt;
					x = m.x + Math.sin(m.t * 0.6) * 6;
					ctx.fillStyle = ink;
				} else if (kind === "fireflies") {
					// Wander: drift, and turn a little at a time.
					m.vx += rand(-14, 14) * dt;
					m.vy += rand(-14, 14) * dt;
					m.vx = Math.max(-12, Math.min(12, m.vx));
					m.vy = Math.max(-12, Math.min(12, m.vy));
					m.x += m.vx * dt;
					m.y += m.vy * dt;
					x = m.x;
					y = m.y;
					alpha = m.alpha * (0.55 + 0.45 * Math.sin(m.t * 1.3));
					ctx.fillStyle = lime;
					ctx.shadowColor = lime;
					ctx.shadowBlur = 14;
				} else {
					// Near stars slide with the page more than far ones.
					y = (((m.y - scroll * (0.12 - m.depth * 0.1)) % h) + h) % h;
					alpha = m.alpha * (0.6 + 0.4 * Math.sin(m.t * (0.6 + m.depth)));
					ctx.fillStyle = ink;
				}

				// Off one edge, back in at the other.
				if (m.x < -10) m.x = w + 10;
				if (m.x > w + 10) m.x = -10;
				if (m.y < -10) m.y = h + 10;
				if (m.y > h + 10) m.y = -10;

				ctx.globalAlpha = Math.max(0, alpha);
				ctx.beginPath();
				ctx.arc(x, y, m.r, 0, Math.PI * 2);
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
		window.addEventListener("resize", seed);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelAnimationFrame(frame);
			themeWatch.disconnect();
			window.removeEventListener("resize", seed);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);

	return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 size-full" />;
}
