"use client";

import { useEffect, useRef, useState } from "react";

import { type Colours, type Density, type Field, type Physics, readColours, seed, siteDensity, sitePhysics, step } from "@/components/site/particles";

import { Choice, Knob, Knobs, type MachineProps, Screen, stack, useInView } from "./kit";

/**
 * The site's background particles in a box, with the physics on knobs. Move
 * the pointer (or a finger) through them: they part, then a spring settles
 * them back. Same code as the background (`particles.ts`).
 */
export function Fireflies({ active = true, compact = false, layout = stack }: MachineProps) {
	const screen = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const inView = useInView(screen);
	const running = active && inView;

	const [physics, setPhysics] = useState<Physics>(sitePhysics);
	// Denser than the site's, so a small box has a crowd to push through.
	const [density, setDensity] = useState<Density>({ ...siteDensity, dust: 600, flies: 40 });
	const [show, setShow] = useState<"both" | "dust" | "flies">("both");

	// Read every frame, so turning a knob doesn't restart anything.
	const live = useRef({ physics, show });
	live.current = { physics, show };

	useEffect(() => {
		const el = canvas.current;
		const box = screen.current;
		const ctx = el?.getContext("2d");
		if (!el || !box || !ctx) return;
		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let w = 0;
		let h = 0;
		let field: Field = { dust: [], flies: [] };
		let colours: Colours = readColours(box);
		const pointer = { x: -1e6, y: -1e6 };

		const draw = (dt: number) => {
			const { physics, show } = live.current;
			step(ctx, field, dt, { w, h }, pointer, colours, physics, { dust: show !== "flies", flies: show !== "dust" });
		};
		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = box.clientWidth;
			h = box.clientHeight;
			el.width = w * dpr;
			el.height = h * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			// A change of density starts a fresh field.
			field = seed({ dust: [], flies: [] }, w, h, density);
			draw(0);
		};
		resize();

		const onMove = (event: PointerEvent) => {
			const rect = box.getBoundingClientRect();
			pointer.x = event.clientX - rect.left;
			pointer.y = event.clientY - rect.top;
		};
		const onLeave = () => {
			pointer.x = pointer.y = -1e6;
		};
		box.addEventListener("pointermove", onMove);
		box.addEventListener("pointerleave", onLeave);
		const sizeWatch = new ResizeObserver(resize);
		sizeWatch.observe(box);
		const themeWatch = new MutationObserver(() => {
			colours = readColours(box);
			draw(0);
		});
		themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

		let frame = 0;
		if (running && !still) {
			let last = performance.now();
			const loop = (now: number) => {
				draw(Math.min(0.05, (now - last) / 1000));
				last = now;
				frame = requestAnimationFrame(loop);
			};
			frame = requestAnimationFrame(loop);
		}
		return () => {
			cancelAnimationFrame(frame);
			box.removeEventListener("pointermove", onMove);
			box.removeEventListener("pointerleave", onLeave);
			sizeWatch.disconnect();
			themeWatch.disconnect();
		};
	}, [running, density]);

	const set = (key: keyof Physics) => (value: number) => setPhysics((p) => ({ ...p, [key]: value }));

	return layout(
		<Screen ref={screen} className="aspect-[4/3] touch-none">
			<canvas ref={canvas} aria-label="Particles that part around the pointer" className="absolute inset-0 size-full" />
		</Screen>,
		compact ? null : (
			<Knobs>
				<Knob label="Push reach" value={physics.reach} min={40} max={300} unit="px" onChange={set("reach")} />
				<Knob label="Push strength" value={physics.push} min={0} max={20000} step={200} onChange={set("push")} />
				<Knob label="Spring stiffness" value={physics.stiffness} min={1} max={40} step={0.5} onChange={set("stiffness")} />
				<Knob label="Damping" value={physics.damping} min={0} max={12} step={0.1} onChange={set("damping")} />
				<Knob label="Dust per megapixel" value={density.dust} min={0} max={2000} step={20} onChange={(dust) => setDensity((d) => ({ ...d, dust }))} />
				<Knob label="Fireflies per megapixel" value={density.flies} min={0} max={200} step={2} onChange={(flies) => setDensity((d) => ({ ...d, flies }))} />
				<Knob label="Size" value={density.size} min={0.5} max={4} step={0.1} unit="×" onChange={(size) => setDensity((d) => ({ ...d, size }))} />
				<Choice
					label="Show"
					value={show}
					options={[
						{ value: "both", label: "Both" },
						{ value: "dust", label: "Dust" },
						{ value: "flies", label: "Fireflies" },
					]}
					onChange={setShow}
				/>
			</Knobs>
		),
	);
}
