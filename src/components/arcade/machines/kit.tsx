"use client";

import { useEffect, useId, useState } from "react";

import { mono } from "@/components/site/ui";

/**
 * The pieces every Arcade machine is built from: a screen to play on, and
 * knobs to change how it plays.
 */

/** Where a machine plays. 4:3 unless the machine needs its own height. */
export function Screen({ children, className = "", ...rest }: React.ComponentProps<"div">) {
	return (
		<div {...rest} className={`relative overflow-hidden bg-[var(--bg)] ${className || "aspect-[4/3]"}`}>
			{children}
		</div>
	);
}

/** A row of knobs under a screen. */
export function Knobs({ children }: { children: React.ReactNode }) {
	return <div className={`${mono} grid gap-x-6 gap-y-3 pt-4 text-xs uppercase tracking-wider sm:grid-cols-2`}>{children}</div>;
}

/** A labelled slider, showing its value. */
export function Knob({
	label,
	value,
	min,
	max,
	step = 1,
	unit = "",
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number;
	unit?: string;
	onChange: (value: number) => void;
}) {
	const id = useId();
	return (
		<div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
			<label htmlFor={id} className="text-[var(--dim)]">
				{label}
			</label>
			<output htmlFor={id} className="tabular-nums">
				{value}
				{unit}
			</output>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(event) => onChange(Number(event.target.value))}
				className="col-span-2 w-full accent-[var(--accent-ink)]"
			/>
		</div>
	);
}

/** Two or three choices, one picked. */
export function Choice<T extends string>({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
}) {
	return (
		<fieldset className="grid gap-1">
			<legend className="mb-1 text-[var(--dim)]">{label}</legend>
			<div className="flex flex-wrap gap-1">
				{options.map((option) => (
					<button
						key={option.value}
						type="button"
						aria-pressed={value === option.value}
						onClick={() => onChange(option.value)}
						className={`px-2 py-1.5 font-bold ${value === option.value ? "bg-[var(--lime)] text-[#0c0c0d]" : "border border-[var(--line)] hover:border-[var(--ink)]"}`}
					>
						{option.label}
					</button>
				))}
			</div>
		</fieldset>
	);
}

/** Whether the element is on screen, so a machine can rest while it isn't. */
export function useInView<T extends Element>(ref: React.RefObject<T | null>) {
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
		observer.observe(el);
		return () => observer.disconnect();
	}, [ref]);
	return inView;
}

/** How a frame places a machine's screen and its knobs (`null` when compact). */
export type Layout = (screen: React.ReactNode, knobs: React.ReactNode) => React.ReactNode;

/** The plain layout: the knobs under the screen. */
export const stack: Layout = (screen, knobs) => (
	<div>
		{screen}
		{knobs}
	</div>
);

/**
 * What every machine is given: whether it's the one being played, whether to
 * leave its knobs out, and how to lay out its screen and knobs.
 */
export type MachineProps = { active?: boolean; compact?: boolean; layout?: Layout };
