"use client";

import { motion, useAnimationControls } from "motion/react";
import { useRef, useState } from "react";

import { label, mono } from "../ui";

const spring = { type: "spring", stiffness: 500, damping: 18 } as const;

/** 5. Three small toys that show what the headline means instead of saying it. */
export function FeelIt() {
	return (
		<div className="border-2 border-[var(--ink)] bg-[var(--card)]">
			<div className={`${mono} border-b-2 border-[var(--ink)] px-4 py-2 text-xs uppercase tracking-widest`}>Try it</div>
			<div className="grid grid-cols-3 divide-x divide-[var(--line)]">
				<Toy name="Press">
					<Press />
				</Toy>
				<Toy name="Fling">
					<Fling />
				</Toy>
				<Toy name="Flip">
					<Flip />
				</Toy>
			</div>
			<p className="border-t border-[var(--line)] px-4 py-3 text-lg leading-snug">
				This is what I mean by <span className="bg-[var(--lime)] px-1 text-[#0c0c0d]">magical</span>: things that answer your
				hand.
			</p>
		</div>
	);
}

function Toy({ name, children }: { name: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col items-center gap-3 px-2 py-5">
			<div className="flex h-24 w-full items-center justify-center">{children}</div>
			<p className={label}>{name}</p>
		</div>
	);
}

/** A button that squashes under the press and springs back, counting. */
function Press() {
	const [count, setCount] = useState(0);
	return (
		<motion.button
			type="button"
			onClick={() => setCount((n) => n + 1)}
			whileHover={{ scale: 1.06 }}
			whileTap={{ scale: 0.82 }}
			transition={spring}
			className={`${mono} size-16 rounded-full border-2 border-[var(--ink)] bg-[var(--lime)] text-sm font-bold text-[#0c0c0d] shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]`}
			aria-label={`Press me (pressed ${count} times)`}
		>
			<motion.span key={count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
				{count || "Hi"}
			</motion.span>
		</motion.button>
	);
}

/** A square you can throw: it stretches with the pull and springs home. By keyboard, it hops. */
function Fling() {
	const box = useRef<HTMLDivElement>(null);
	const controls = useAnimationControls();
	return (
		<div ref={box} className="relative flex size-full items-center justify-center">
			<motion.button
				type="button"
				drag
				dragConstraints={box}
				dragElastic={0.7}
				dragSnapToOrigin
				dragTransition={{ bounceStiffness: 500, bounceDamping: 14 }}
				whileDrag={{ scale: 1.15, rotate: 8 }}
				animate={controls}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						controls.start({ y: [0, -28, 0], rotate: [0, 90, 90], transition: { duration: 0.5 } }).then(() => controls.set({ rotate: 0 }));
					}
				}}
				className="size-12 cursor-grab touch-none border-2 border-[var(--ink)] bg-[var(--ink)] active:cursor-grabbing"
				aria-label="A square to throw around. Press Enter to make it hop."
			/>
		</div>
	);
}

/** A switch whose knob stretches as it travels. */
function Flip() {
	const [on, setOn] = useState(false);
	return (
		<button
			type="button"
			role="switch"
			aria-checked={on}
			aria-label="A switch"
			onClick={() => setOn((value) => !value)}
			className={`flex h-9 w-16 items-center border-2 border-[var(--ink)] p-1 ${on ? "justify-end bg-[var(--lime)]" : "justify-start bg-[var(--bg)]"}`}
		>
			<motion.span layout transition={spring} className="block h-full w-6 bg-[var(--ink)]" />
		</button>
	);
}
