"use client";

import { useEffect, useRef } from "react";

/**
 * Fireflies drifting behind the whole site, on one canvas that never takes a
 * click: a dozen or so soft dots that wander and pulse. Lime on dark; on the
 * light theme a deep olive core inside the lime glow, so they show on paper.
 *
 * They pause in a hidden tab, thin out on small screens, change with the
 * theme, and don't run at all under reduced motion.
 */

type Fly = {
	x: number;
	y: number;
	r: number;
	alpha: number;
	vx: number;
	vy: number;
	/** Phase, for the pulse. */
	t: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function Atmosphere() {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const el = canvas.current;
		if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = el.getContext("2d");
		if (!ctx) return;

		let w = 0;
		let h = 0;
		let flies: Fly[] = [];
		const site = el.closest<HTMLElement>("[data-site]") ?? document.documentElement;
		let core = "#c6f03a";
		let glow = "#c6f03a";
		const readColours = () => {
			const style = getComputedStyle(site);
			const dark = document.documentElement.classList.contains("dark");
			glow = style.getPropertyValue("--lime").trim() || glow;
			// --accent-ink is the deep olive on light, lime on dark.
			core = dark ? glow : style.getPropertyValue("--accent-ink").trim() || "#3f6212";
		};

		const seed = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = window.innerWidth;
			h = window.innerHeight;
			el.width = w * dpr;
			el.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const count = Math.round(16 + ((w * h) / 1_000_000) * 16);
			flies = Array.from({ length: count }, () => ({
				x: rand(0, w),
				y: rand(0, h),
				r: rand(1.2, 2),
				alpha: rand(0.45, 0.85),
				vx: rand(-8, 8),
				vy: rand(-8, 8),
				t: rand(0, Math.PI * 2),
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
			ctx.fillStyle = core;
			ctx.shadowColor = glow;
			ctx.shadowBlur = 10;

			for (const f of flies) {
				f.t += dt;
				// Wander: drift, turning a little at a time.
				f.vx = Math.max(-12, Math.min(12, f.vx + rand(-14, 14) * dt));
				f.vy = Math.max(-12, Math.min(12, f.vy + rand(-14, 14) * dt));
				f.x += f.vx * dt;
				f.y += f.vy * dt;
				// Off one edge, back in at the other.
				if (f.x < -10) f.x = w + 10;
				if (f.x > w + 10) f.x = -10;
				if (f.y < -10) f.y = h + 10;
				if (f.y > h + 10) f.y = -10;

				ctx.globalAlpha = f.alpha * (0.55 + 0.45 * Math.sin(f.t * 1.3));
				ctx.beginPath();
				ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
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
