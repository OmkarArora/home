"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * A line down the left of its children that draws itself as the page scrolls.
 *
 * Every descendant marked `data-trace-node` becomes a stop: the line jogs
 * sideways through it, circuit-board style, and the stop lights up (it gets
 * `data-on="true"`, as does its marker) once the line has reached it. The tip
 * of the line sits 60% of the way down the window, so what is being read is
 * what has just been drawn.
 *
 * The drawing is tied to the scroll position rather than played, so there is
 * nothing to switch off for reduced motion: it only moves when the reader does.
 */

const WIDTH = 40;
const NEAR = 10;
const FAR = 30;
/** Half the height of the diagonal that crosses a stop. */
const JOG = 10;
const TIP = 0.6;

type Segment = { y0: number; y1: number; length: number };
type Shape = { d: string; height: number; stops: number[]; segments: Segment[]; total: number };

/** The element's top edge, measured from `root`, ignoring any transforms. */
function offsetWithin(element: HTMLElement, root: HTMLElement) {
	let top = 0;
	let node: HTMLElement | null = element;
	while (node && node !== root) {
		top += node.offsetTop;
		node = node.offsetParent as HTMLElement | null;
	}
	return top;
}

function shapeFor(root: HTMLElement): Shape {
	const height = root.offsetHeight;
	const stops = [...root.querySelectorAll<HTMLElement>("[data-trace-node]")].map(
		(node) => offsetWithin(node, root) + node.offsetHeight / 2,
	);

	const segments: Segment[] = [];
	let d = `M${NEAR} 0`;
	let x = NEAR;
	let y = 0;
	const diagonal = Math.hypot(FAR - NEAR, JOG * 2);

	for (const stop of stops) {
		const from = Math.max(y, stop - JOG);
		segments.push({ y0: y, y1: from, length: from - y });
		x = x === NEAR ? FAR : NEAR;
		d += ` V${from} L${x} ${stop + JOG}`;
		segments.push({ y0: from, y1: stop + JOG, length: diagonal });
		y = stop + JOG;
	}
	segments.push({ y0: y, y1: height, length: Math.max(0, height - y) });
	d += ` V${height}`;

	const total = segments.reduce((sum, segment) => sum + segment.length, 0);
	return { d, height, stops, segments, total };
}

/** How much of the line lies above `y`. */
function lengthAbove(shape: Shape, y: number) {
	let length = 0;
	for (const segment of shape.segments) {
		if (y >= segment.y1) length += segment.length;
		else if (y > segment.y0) length += (segment.length * (y - segment.y0)) / (segment.y1 - segment.y0);
	}
	return length;
}

export function Trace({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	const root = useRef<HTMLDivElement>(null);
	const drawn = useRef<SVGPathElement>(null);
	const tip = useRef<SVGRectElement>(null);
	const [shape, setShape] = useState<Shape | null>(null);

	// Measure the stops, and again whenever the layout changes height.
	useLayoutEffect(() => {
		const element = root.current;
		if (!element) return;
		const measure = () => setShape(shapeFor(element));
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const element = root.current;
		const path = drawn.current;
		if (!shape || !element || !path) return;

		const nodes = [...element.querySelectorAll<HTMLElement>("[data-trace-node]")];
		const marks = [...element.querySelectorAll<SVGElement>("[data-trace-mark]")];
		let frame = 0;

		const draw = () => {
			frame = 0;
			const { top } = element.getBoundingClientRect();
			const page = document.documentElement;
			const atEnd = window.scrollY + window.innerHeight >= page.scrollHeight - 2;
			// At the very bottom there may be no scroll left to bring the tip down.
			const reach = atEnd ? shape.height : window.innerHeight * TIP - top;
			const y = Math.min(shape.height, Math.max(0, reach));

			const length = lengthAbove(shape, y);
			path.style.strokeDashoffset = String(shape.total - length);

			const point = path.getPointAtLength(length);
			if (tip.current) {
				tip.current.setAttribute("x", String(point.x - 3));
				tip.current.setAttribute("y", String(point.y - 3));
				tip.current.style.opacity = y > 0 && y < shape.height ? "1" : "0";
			}

			shape.stops.forEach((stop, index) => {
				const on = String(y >= stop);
				nodes[index]?.setAttribute("data-on", on);
				marks[index]?.setAttribute("data-on", on);
			});
		};

		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(draw);
		};
		draw();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			cancelAnimationFrame(frame);
		};
	}, [shape]);

	return (
		<div ref={root} data-trace className={`relative pl-12 md:pl-20 ${className}`}>
			{shape && (
				<svg
					aria-hidden
					width={WIDTH}
					height={shape.height}
					viewBox={`0 0 ${WIDTH} ${shape.height}`}
					className="pointer-events-none absolute top-0 left-0 overflow-visible md:left-4"
					fill="none"
				>
					<path d={shape.d} stroke="var(--line)" strokeWidth={2} />
					<path
						ref={drawn}
						d={shape.d}
						stroke="var(--accent-ink)"
						strokeWidth={2}
						strokeDasharray={shape.total}
						strokeDashoffset={shape.total}
					/>
					{shape.stops.map((stop) => (
						<rect
							key={stop}
							data-trace-mark
							data-on="false"
							x={(NEAR + FAR) / 2 - 5}
							y={stop - 5}
							width={10}
							height={10}
							transform={`rotate(45 ${(NEAR + FAR) / 2} ${stop})`}
							className="fill-[var(--bg)] stroke-[var(--muted)] transition-[fill,stroke] duration-300 data-[on=true]:fill-[var(--accent)] data-[on=true]:stroke-[var(--ink)]"
							strokeWidth={1.5}
						/>
					))}
					<rect ref={tip} width={6} height={6} className="fill-[var(--accent-ink)]" style={{ opacity: 0 }} />
				</svg>
			)}
			{children}
		</div>
	);
}
