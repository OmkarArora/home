"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { play } from "@/components/site/sound";
import { label, mono } from "@/components/site/ui";

import { machines } from "../machines";
import { NeonSign } from "../NeonSign";
import { useMachine } from "./useMachine";

/**
 * Layout B, an arcade floor: a row of small cabinets, each showing its
 * attract screen (the name and INSERT COIN). Pick one and it grows into the
 * full machine with its knobs; Esc or ◀ Back returns to the floor.
 */

const ease = [0.22, 1, 0.36, 1] as const;

export function Floor() {
	const [index, pick] = useMachine(null);
	const open = index === null ? null : machines[index];

	useEffect(() => {
		if (index === null) return;
		const onKey = (event: KeyboardEvent) => event.key === "Escape" && pick(null);
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [index, pick]);

	return (
		<div className="pb-16">
			<div className="mb-10 flex justify-center bg-[#0a0a0b] py-6">
				<NeonSign text="Arcade" broken={4} className="text-[clamp(2rem,8vw,4rem)] tracking-[0.25em]" />
			</div>

			<AnimatePresence mode="popLayout" initial={false}>
				{open ? (
					<motion.section
						key="open"
						layoutId={`cabinet-${open.key}`}
						transition={{ duration: 0.45, ease }}
						className="border-4 border-[#1a1a1d] bg-[#121214] p-3 sm:p-5"
					>
						<div className="flex items-center justify-between gap-4 pb-3">
							<button type="button" data-sfx="close" onClick={() => pick(null)} className={`${mono} text-xs font-bold uppercase tracking-widest text-[#c6f03a]`}>
								◀ Back <span className="text-[#9a9a92]">(Esc)</span>
							</button>
							<p className={`${mono} text-xs uppercase tracking-[0.3em] text-[#9a9a92]`}>{open.name}</p>
						</div>
						<open.Play
							layout={(screen, knobs) => (
								<>
									{screen}
									<div className="mt-1 grid gap-6 bg-[var(--bg)] p-4 md:grid-cols-[1fr_1.2fr] sm:p-6">
										<div>
											<p className={label}>How it works</p>
											<p className="mt-2 leading-relaxed">{open.how}</p>
										</div>
										<div>{knobs}</div>
									</div>
								</>
							)}
						/>
					</motion.section>
				) : (
					<motion.ul key="floor" className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
						{machines.map((machine, i) => (
							<motion.li key={machine.key} layoutId={`cabinet-${machine.key}`} transition={{ duration: 0.45, ease }}>
								<button
									type="button"
									data-sfx="none"
									onClick={() => {
										play("coin");
										pick(i);
									}}
									className="group flex w-full flex-col rounded-t-2xl border-x-[6px] border-t-[6px] border-[#1a1a1d] bg-[#121214] p-2 text-left"
								>
									<span className={`${mono} rounded-t-xl bg-[#0a0a0b] py-2 text-center text-[10px] uppercase tracking-[0.25em] text-[#c6f03a]`}>
										{String(i + 1).padStart(2, "0")}
									</span>
									<span className="mt-2 flex aspect-[3/4] flex-col justify-between border-4 border-[#050506] bg-[#050506] p-3">
										<span className="text-xl leading-none font-extrabold tracking-[-0.03em] text-[#f3f3ee] [font-stretch:85%] sm:text-2xl">{machine.name}</span>
										<span className={`${mono} text-[10px] uppercase leading-snug tracking-wider text-[#9a9a92]`}>{machine.tag}</span>
										<span className={`${mono} text-[10px] font-bold uppercase tracking-[0.2em] text-[#c6f03a] group-hover:underline`}>Insert coin ▶</span>
									</span>
									<span className="mt-2 flex justify-center gap-2 py-1" aria-hidden>
										<span className="size-3 rounded-full bg-[#c6f03a]" />
										<span className="size-3 rounded-full bg-[#5f7f0a]" />
									</span>
								</button>
							</motion.li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</div>
	);
}
