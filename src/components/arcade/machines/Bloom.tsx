"use client";

import { useRef, useState } from "react";

import { bloom } from "@/components/site/bloom";

import { Choice, Knob, Knobs, type MachineProps, Screen, stack } from "./kit";

/**
 * The theme switch's bloom, on a small mock page: click anywhere and the other
 * theme grows out of that point. The real switch runs the same mask on a View
 * Transition snapshot of the whole page (`bloom.ts`); here it runs on a layer.
 */

const easings = {
	site: { label: "Site", value: "cubic-bezier(0.45, 0, 0.2, 1)" },
	linear: { label: "Linear", value: "linear" },
	snappy: { label: "Snappy", value: "cubic-bezier(0.2, 0.9, 0.1, 1)" },
} as const;

/** The gradient's soft edge: how far in from the rim it starts to fade. */
const edges = {
	soft: "radial-gradient(circle closest-side, #000 70%, transparent 100%)",
	hard: "radial-gradient(circle closest-side, #000 99%, transparent 100%)",
} as const;

const looks = {
	light: { background: "#f3f3ee", color: "#0c0c0d", line: "#d8d8d0" },
	dark: { background: "#0c0c0d", color: "#f3f3ee", line: "#2a2a2c" },
};

/** A tiny page to bloom over: the home headline and a few lines of text. */
function MockPage({ look }: { look: keyof typeof looks }) {
	const { background, color, line } = looks[look];
	return (
		<div className="absolute inset-0 flex flex-col justify-center gap-[4%] p-[8%]" style={{ background, color }}>
			<p className="text-[clamp(1.25rem,5vw,2.5rem)] leading-[0.95] font-extrabold tracking-[-0.035em] [font-stretch:85%]">
				Web that feels{" "}
				<span className="relative inline-block">
					<span className="absolute inset-x-[-0.08em] bottom-[0.08em] top-[0.18em] -skew-x-6 bg-[#c6f03a]" />
					<span className="relative text-[#0c0c0d]">magical</span>
				</span>
			</p>
			{[90, 75, 82, 40].map((width, i) => (
				<span key={i} className="block h-[3%] min-h-1.5" style={{ width: `${width}%`, background: line }} />
			))}
		</div>
	);
}

export function Bloom({ compact = false, layout = stack }: MachineProps) {
	const screen = useRef<HTMLDivElement>(null);
	const layer = useRef<HTMLDivElement>(null);
	const [look, setLook] = useState<"light" | "dark">("light");
	const [blooming, setBlooming] = useState(false);
	const [duration, setDuration] = useState(800);
	const [easing, setEasing] = useState<keyof typeof easings>("site");
	const [edge, setEdge] = useState<keyof typeof edges>("soft");
	const next = look === "light" ? "dark" : "light";

	const go = (event: React.MouseEvent<HTMLButtonElement>) => {
		const box = screen.current?.getBoundingClientRect();
		const target = layer.current;
		if (!box || !target || blooming) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setLook(next);
			return;
		}
		// A keyboard press has no pointer position (it reports 0, 0): bloom from the middle.
		const keyboard = event.detail === 0;
		const origin = keyboard ? { x: box.width / 2, y: box.height / 2 } : { x: event.clientX - box.left, y: event.clientY - box.top };
		setBlooming(true);
		const animation = bloom(target, origin, { w: box.width, h: box.height }, { duration, easing: easings[easing].value });
		animation.finished.then(() => {
			setLook(next);
			setBlooming(false);
			// Let the new look paint underneath before the layer drops its mask.
			requestAnimationFrame(() => animation.cancel());
		});
	};

	return layout(
		<Screen ref={screen}>
			<MockPage look={look} />
			<div
				ref={layer}
				aria-hidden
				className="absolute inset-0"
				style={{ visibility: blooming ? "visible" : "hidden", maskImage: edges[edge], maskRepeat: "no-repeat", maskSize: "0 0" }}
			>
				<MockPage look={next} />
			</div>
			<button type="button" onClick={go} className="absolute inset-0 cursor-crosshair" aria-label={`Bloom into the ${next} theme`} />
		</Screen>,
		compact ? null : (
			<Knobs>
				<Knob label="Duration" value={duration} min={200} max={3000} step={50} unit="ms" onChange={setDuration} />
				<Choice
					label="Easing"
					value={easing}
					options={Object.entries(easings).map(([value, { label }]) => ({ value: value as keyof typeof easings, label }))}
					onChange={setEasing}
				/>
				<Choice
					label="Edge"
					value={edge}
					options={[
						{ value: "soft", label: "Soft (the site's)" },
						{ value: "hard", label: "Hard" },
					]}
					onChange={setEdge}
				/>
			</Knobs>
		),
	);
}
