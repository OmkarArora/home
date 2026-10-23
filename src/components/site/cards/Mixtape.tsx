"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import type { Player } from "../PlayerCard";
import { label, mono } from "../ui";

/** 9. A cassette whose tracks are the work: side A ixigo, side B Sparklin, a bonus track for Game Night. */
export function Mixtape({ player }: { player: Player }) {
	const reduced = useReducedMotion();
	const [track, setTrack] = useState(0);
	const [playing, setPlaying] = useState(false);
	const tracks = player.tracks;
	const now = tracks[track];

	useEffect(() => {
		if (!playing) return;
		const timer = setInterval(() => setTrack((t) => (t + 1) % tracks.length), 3200);
		return () => clearInterval(timer);
	}, [playing, tracks.length]);

	const step = (by: number) => setTrack((t) => (t + by + tracks.length) % tracks.length);
	const numbered = (i: number) => {
		const side = tracks[i].side;
		return `${side === "Bonus" ? "★" : side}${tracks.slice(0, i + 1).filter((t) => t.side === side).length}`;
	};

	return (
		<div className="border-2 border-[var(--ink)] bg-[var(--card)] p-4">
			{/* The cassette. */}
			<div className="relative rounded-md border-2 border-[var(--ink)] bg-[var(--ink)] p-3">
				<div className="rounded-sm bg-[var(--lime)] px-3 pt-2 pb-3 text-[#0c0c0d]">
					<div className={`${mono} flex justify-between text-xs font-bold uppercase tracking-widest`}>
						<span>{player.name.split(" ")[0]}&apos;s mix</span>
						<span>2021 – 2026</span>
					</div>
					<div className="mx-auto mt-2 flex h-14 w-4/5 items-center justify-between rounded-full border-2 border-[#0c0c0d] bg-[#f3f3ee] px-3">
						{[0, 1].map((reel) => (
							<motion.svg
								key={reel}
								viewBox="0 0 24 24"
								className="size-9"
								animate={playing && !reduced ? { rotate: 360 } : { rotate: 0 }}
								transition={playing ? { repeat: Infinity, ease: "linear", duration: reel ? 2.2 : 1.6 } : { duration: 0.3 }}
								aria-hidden
							>
								<circle cx="12" cy="12" r="10" fill="none" stroke="#0c0c0d" strokeWidth="2.5" />
								{[0, 60, 120].map((a) => (
									<rect key={a} x="11" y="3" width="2" height="6" fill="#0c0c0d" transform={`rotate(${a} 12 12)`} />
								))}
								<circle cx="12" cy="12" r="2.5" fill="#0c0c0d" />
							</motion.svg>
						))}
					</div>
				</div>
			</div>

			{/* Now playing and the controls. */}
			<div className="mt-4 flex items-center justify-between gap-3">
				<div className="min-w-0" aria-live="polite">
					<p className={label}>
						{numbered(track)} · {now.year}
					</p>
					<p className="truncate text-xl font-bold tracking-tight">{now.title}</p>
				</div>
				<div className={`${mono} flex shrink-0 border border-[var(--ink)] text-sm`}>
					<button type="button" onClick={() => step(-1)} aria-label="Previous track" className="px-2.5 py-1.5 hover:bg-[var(--soft)]">
						⏮
					</button>
					<button
						type="button"
						onClick={() => setPlaying((p) => !p)}
						aria-label={playing ? "Pause" : "Play"}
						className="border-x border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-[var(--bg)]"
					>
						{playing ? "❚❚" : "▶"}
					</button>
					<button type="button" onClick={() => step(1)} aria-label="Next track" className="px-2.5 py-1.5 hover:bg-[var(--soft)]">
						⏭
					</button>
				</div>
			</div>

			<ol className={`${mono} mt-3 grid grid-cols-2 gap-x-4 border-t border-[var(--line)] pt-3 text-xs uppercase tracking-wider`}>
				{tracks.map((t, i) => (
					<li key={t.title} className="min-w-0">
						<button
							type="button"
							onClick={() => setTrack(i)}
							className={`w-full truncate py-0.5 text-left ${i === track ? "font-bold text-[var(--ink)]" : "text-[var(--dim)] hover:text-[var(--ink)]"}`}
						>
							{numbered(i)} {t.title}
						</button>
					</li>
				))}
			</ol>
		</div>
	);
}
