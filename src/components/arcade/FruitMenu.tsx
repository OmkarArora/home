"use client";

import { Apple, Banana, Cherry, ChevronDown, Citrus } from "lucide-react";
import { motion } from "motion/react";
import { useId, useRef, useState } from "react";

const fruits = [
	{ icon: Banana, name: "Banana" },
	{ icon: Apple, name: "Apple" },
	{ icon: Cherry, name: "Cherry" },
	{ icon: Citrus, name: "Citrus" },
];

/** The list drops open, then its items follow one after another: Motion's variants orchestrating children. */
const list = {
	open: { height: "auto", opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
	closed: { height: 0, opacity: 0, transition: { staggerChildren: 0.06, staggerDirection: -1 } },
};
const item = { open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: -10 } };

/**
 * A dropdown whose options arrive in a stagger.
 *
 * After https://www.youtube.com/watch?v=XtOJlF9UuiU
 */
export function FruitMenu() {
	const [open, setOpen] = useState(false);
	const [picked, setPicked] = useState<string | null>(null);
	const id = useId();
	const toggle = useRef<HTMLButtonElement>(null);
	// Closing hides the options, so focus goes back to the button that opened them.
	const close = () => {
		setOpen(false);
		toggle.current?.focus();
	};

	return (
		<div
			className="relative w-52"
			onKeyDown={(event) => {
				if (event.key === "Escape" && open) close();
			}}
		>
			<motion.button
				ref={toggle}
				type="button"
				aria-expanded={open}
				aria-controls={id}
				initial={false}
				animate={open ? { paddingTop: 10, paddingBottom: 10 } : { paddingTop: 8, paddingBottom: 8 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				onClick={() => setOpen((value) => !value)}
				className="flex w-full items-center justify-between rounded-md bg-[var(--soft)] px-3 font-[family-name:var(--lab-mono)] text-sm font-bold uppercase tracking-wider hover:bg-[var(--line)]"
			>
				{picked ?? "Pick a fruit"}
				<ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
			</motion.button>
			<motion.ul
				id={id}
				initial={false}
				animate={open ? "open" : "closed"}
				variants={list}
				className="absolute inset-x-0 top-full mt-1 overflow-hidden rounded-b-lg rounded-t-[4px] bg-[var(--card)] shadow-lg ring-1 ring-[var(--line)]"
				// Closed, the options must leave the tab order too.
				inert={!open}
			>
				{fruits.map(({ icon: Icon, name }) => (
					<motion.li key={name} variants={item}>
						<button
							type="button"
							onClick={() => {
								setPicked(name);
								close();
							}}
							className="flex w-full items-center gap-4 px-4 py-2 text-left hover:bg-[var(--soft)] focus-visible:bg-[var(--soft)] focus-visible:outline-none"
						>
							<Icon className="size-5" />
							{name}
						</button>
					</motion.li>
				))}
			</motion.ul>
		</div>
	);
}
