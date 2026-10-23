"use client";

import { motion } from "motion/react";

import type { Player } from "../PlayerCard";
import { label, mono } from "../ui";

/** Bars of a barcode, drawn from the passenger's name so it never changes. */
function bars(seed: string) {
	return [...seed.repeat(3)].map((char, i) => 1 + ((char.charCodeAt(0) * (i + 7)) % 4));
}

/** 4. A boarding pass from Sparklin to ixigo. The stub tears a little on hover; its barcode opens the resume. */
export function BoardingPass({ player }: { player: Player }) {
	const from = { code: "SPK", name: "Sparklin", year: new Date(player.careerStart).getFullYear() };
	const to = { code: "IXG", name: player.company, year: 2026 };

	return (
		<motion.div initial="rest" whileHover="torn" animate="rest" className="relative">
			<div className="border-2 border-[var(--ink)] bg-[var(--card)]">
				<div className={`${mono} flex items-center justify-between bg-[var(--lime)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#0c0c0d]`}>
					<span>Boarding pass</span>
					<span aria-hidden>✈</span>
				</div>

				<div className="p-4 sm:p-5">
					<p className={label}>Passenger</p>
					<p className="text-2xl leading-tight font-bold tracking-tight">{player.name}</p>

					<div className="mt-5 flex items-end justify-between gap-3">
						<div>
							<p className="text-5xl leading-none font-extrabold tracking-tight [font-stretch:85%]">{from.code}</p>
							<p className={`${label} mt-1`}>
								{from.name} · {from.year}
							</p>
						</div>
						<div className="relative mb-6 h-px flex-1 border-t-2 border-dashed border-[var(--dim)]">
							<motion.span
								aria-hidden
								className="absolute -top-[0.8rem] text-lg"
								initial={{ left: "0%" }}
								animate={{ left: "85%" }}
								transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
							>
								✈
							</motion.span>
						</div>
						<div className="text-right">
							<p className="text-5xl leading-none font-extrabold tracking-tight [font-stretch:85%]">{to.code}</p>
							<p className={`${label} mt-1`}>
								{to.name} · {to.year}
							</p>
						</div>
					</div>

					<dl className={`${mono} mt-5 grid grid-cols-4 gap-2 text-xs uppercase`}>
						{[
							["Class", "Senior"],
							["Gate", "Web"],
							["Seat", "Frontend"],
							["Boarded", "Apr 26"],
						].map(([k, v]) => (
							<div key={k}>
								<dt className="tracking-widest text-[var(--dim)]">{k}</dt>
								<dd className="mt-1 font-bold">{v}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>

			{/* The stub, past a perforation. */}
			<motion.a
				href="/resume"
				variants={{ rest: { rotate: 0, y: 0 }, torn: { rotate: 2.5, y: 6 } }}
				transition={{ type: "spring", stiffness: 300, damping: 18 }}
				className="group relative -mt-[2px] flex origin-top-left items-center justify-between gap-4 border-2 border-t-0 border-[var(--ink)] bg-[var(--card)] px-4 py-3"
				aria-label="Open my resume"
			>
				<span aria-hidden className="absolute inset-x-3 -top-px border-t-2 border-dotted border-[var(--dim)]" />
				<span aria-hidden className="flex h-8 items-stretch gap-[2px]">
					{bars(player.name).map((width, i) => (
						<span key={i} style={{ width }} className={i % 2 ? "bg-transparent" : "bg-[var(--ink)]"} />
					))}
				</span>
				<span className={`${mono} shrink-0 text-xs font-bold uppercase tracking-widest group-hover:text-[var(--accent-ink)]`}>
					Resume ↗
				</span>
			</motion.a>
		</motion.div>
	);
}
