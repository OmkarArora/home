"use client";

import { HexagonIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const blurIn = {
	initial: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
	animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
	exit: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
	transition: { duration: 0.5, ease: "easeInOut" },
} as const;

/**
 * A card that dissolves away when dismissed and comes back on reset, with a
 * blurred panel inside that sharpens when you point at it or tab to it.
 */
export function StackCard() {
	const [open, setOpen] = useState(true);

	return (
		<div className="relative flex h-full w-full items-center justify-center">
			<AnimatePresence mode="wait">
				{open ? (
					<motion.div
						key="card"
						{...blurIn}
						className="flex h-[19rem] w-64 flex-col rounded-lg bg-[var(--card)] p-5 text-[var(--ink)] shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)]"
					>
						<p className="font-bold">Card heading</p>
						<p className="text-sm text-[var(--dim)]">Subheading</p>

						<button
							type="button"
							onClick={() => setOpen(false)}
							aria-label="Dismiss the card"
							className="mx-auto mt-4 flex items-center gap-1.5 rounded-2xl bg-[var(--card)] px-2.5 py-1 text-sm shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] ring-1 ring-[var(--line)]"
						>
							<HexagonIcon className="size-4" />
							Hexagon
							<X className="size-4 text-[var(--dim)]" />
						</button>

						<div className="relative mt-4 flex-1 rounded-lg border border-dashed border-[var(--line)] bg-[var(--soft)]">
							<motion.div
								tabIndex={0}
								aria-label="Hidden rows: point here or focus to reveal"
								initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
								whileHover={{ opacity: 1, scale: 1.05, filter: "blur(0px)" }}
								whileFocus={{ opacity: 1, scale: 1.05, filter: "blur(0px)" }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								className="absolute inset-0 flex flex-col divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--card)] text-sm outline-none"
							>
								{["Row 1", "Row 2", "Row 3"].map((row) => (
									<div key={row} className="flex flex-1 items-center justify-center">
										{row}
									</div>
								))}
							</motion.div>
						</div>
					</motion.div>
				) : (
					<motion.button
						key="reset"
						{...blurIn}
						type="button"
						autoFocus
						onClick={() => setOpen(true)}
						className="font-[family-name:var(--lab-mono)] text-xs font-bold uppercase tracking-widest underline decoration-[var(--lime)] decoration-2 underline-offset-4"
					>
						Reset
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
