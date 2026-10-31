"use client";

import { useEffect, useRef } from "react";

import { type Colours, type Field, readColours, seed, step } from "./particles";

/**
 * Dust and fireflies drifting behind the whole site, on one canvas that never
 * takes a click (the particles themselves are in `particles.ts`). The mouse
 * parts them like water. They pause in a hidden tab, thin out on small
 * screens, change with the theme, and don't run at all under reduced motion.
 */

export function Atmosphere() {
	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const el = canvas.current;
		if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const ctx = el.getContext("2d");
		if (!ctx) return;

		let w = 0;
		let h = 0;
		let field: Field = { dust: [], flies: [] };
		const site = el.closest<HTMLElement>("[data-site]") ?? document.documentElement;
		let colours: Colours = readColours(site);
		const recolour = () => (colours = readColours(site));

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = window.innerWidth;
			h = window.innerHeight;
			el.width = w * dpr;
			el.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			field = seed(field, w, h);
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

		resize();

		let frame = 0;
		let last = performance.now();
		const draw = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			step(ctx, field, dt, { w, h }, pointer, colours);
			frame = requestAnimationFrame(draw);
		};

		const start = () => {
			cancelAnimationFrame(frame);
			last = performance.now();
			frame = requestAnimationFrame(draw);
		};
		const onVisibility = () => (document.hidden ? cancelAnimationFrame(frame) : start());
		// The theme is a class on <html>; recolour when it changes.
		const themeWatch = new MutationObserver(recolour);
		themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

		start();
		window.addEventListener("pointermove", onMove, { passive: true });
		document.documentElement.addEventListener("pointerleave", onLeave);
		window.addEventListener("resize", resize);
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			cancelAnimationFrame(frame);
			themeWatch.disconnect();
			window.removeEventListener("pointermove", onMove);
			document.documentElement.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("resize", resize);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, []);

	return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-0 size-full" />;
}
