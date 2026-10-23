"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { label, mono } from "../ui";

/**
 * 6. A round of Dots and Boxes on a 3×3 board, against a small bot. Close a box
 * and you go again. The bot takes any box it can, avoids handing you one when
 * it can help it, and otherwise picks at random.
 */

const size = 3;
type Who = "you" | "bot";
type Line = { dir: "h" | "v"; r: number; c: number };

const key = ({ dir, r, c }: Line) => `${dir}${r}${c}`;
const allLines: Line[] = [
	...Array.from({ length: (size + 1) * size }, (_, i) => ({ dir: "h" as const, r: Math.floor(i / size), c: i % size })),
	...Array.from({ length: size * (size + 1) }, (_, i) => ({ dir: "v" as const, r: Math.floor(i / (size + 1)), c: i % (size + 1) })),
];

/** The four sides of box (r, c). */
const sides = (r: number, c: number) => [`h${r}${c}`, `h${r + 1}${c}`, `v${r}${c}`, `v${r}${c + 1}`];
/** The boxes a line borders. */
function boxesOf({ dir, r, c }: Line): Array<[number, number]> {
	const out: Array<[number, number]> = dir === "h" ? [[r - 1, c], [r, c]] : [[r, c - 1], [r, c]];
	return out.filter(([br, bc]) => br >= 0 && bc >= 0 && br < size && bc < size);
}
const drawnSides = (drawn: Set<string>, r: number, c: number) => sides(r, c).filter((s) => drawn.has(s)).length;

function botMove(drawn: Set<string>): Line {
	const open = allLines.filter((line) => !drawn.has(key(line)));
	const closes = open.find((line) => boxesOf(line).some(([r, c]) => drawnSides(drawn, r, c) === 3));
	if (closes) return closes;
	const safe = open.filter((line) => boxesOf(line).every(([r, c]) => drawnSides(drawn, r, c) < 2));
	const pool = safe.length ? safe : open;
	return pool[Math.floor(Math.random() * pool.length)];
}

export function PlayRound() {
	const [drawn, setDrawn] = useState<Set<string>>(new Set());
	const [owners, setOwners] = useState<Record<string, Who>>({});
	const [turn, setTurn] = useState<Who>("you");

	const done = drawn.size === allLines.length;
	const score = (who: Who) => Object.values(owners).filter((o) => o === who).length;

	function play(line: Line, who: Who) {
		const next = new Set(drawn).add(key(line));
		const won = boxesOf(line).filter(([r, c]) => drawnSides(next, r, c) === 4);
		setDrawn(next);
		if (won.length) setOwners((o) => ({ ...o, ...Object.fromEntries(won.map(([r, c]) => [`${r}${c}`, who])) }));
		else setTurn(who === "you" ? "bot" : "you");
	}

	useEffect(() => {
		if (turn !== "bot" || done) return;
		const timer = setTimeout(() => play(botMove(drawn), "bot"), 550);
		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- `play` reads the same state this effect keys on
	}, [turn, drawn, done]);

	const reset = () => {
		setDrawn(new Set());
		setOwners({});
		setTurn("you");
	};

	const gap = 64;
	const pad = 14;
	const board = gap * size + pad * 2;
	const status = done
		? score("you") > score("bot")
			? "You win!"
			: score("you") < score("bot")
				? "Bot wins."
				: "A draw."
		: turn === "you"
			? "Your move"
			: "Bot is thinking…";

	return (
		<div className="border-2 border-[var(--ink)] bg-[var(--card)]">
			<div className={`${mono} flex items-center justify-between border-b-2 border-[var(--ink)] px-4 py-2 text-xs uppercase tracking-widest`}>
				<span>Dots and Boxes</span>
				<span>
					You <b className="text-[var(--accent-ink)]">{score("you")}</b> · Bot <b>{score("bot")}</b>
				</span>
			</div>

			<div className="flex flex-col items-center gap-3 p-4">
				<div className="relative" style={{ width: board, height: board }} role="group" aria-label="Board">
					{Object.entries(owners).map(([rc, who]) => (
						<motion.div
							key={rc}
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							className={`${mono} absolute flex items-center justify-center text-xs font-bold ${who === "you" ? "bg-[var(--lime)] text-[#0c0c0d]" : "bg-[var(--soft)] text-[var(--dim)]"}`}
							style={{ left: pad + Number(rc[1]) * gap + 6, top: pad + Number(rc[0]) * gap + 6, width: gap - 12, height: gap - 12 }}
						>
							{who === "you" ? "YOU" : "BOT"}
						</motion.div>
					))}

					{allLines.map((line) => {
						const id = key(line);
						const on = drawn.has(id);
						const h = line.dir === "h";
						return (
							<button
								key={id}
								type="button"
								disabled={on || turn !== "you" || done}
								onClick={() => play(line, "you")}
								aria-label={`${h ? "Horizontal" : "Vertical"} line, row ${line.r + 1}, column ${line.c + 1}${on ? ", drawn" : ""}`}
								className="group absolute flex items-center justify-center disabled:cursor-default"
								style={
									h
										? { left: pad + line.c * gap + 8, top: pad + line.r * gap - 9, width: gap - 16, height: 18 }
										: { left: pad + line.c * gap - 9, top: pad + line.r * gap + 8, width: 18, height: gap - 16 }
								}
							>
								<span
									className={`block rounded-full transition-colors ${h ? "h-1 w-full" : "h-full w-1"} ${on ? "bg-[var(--ink)]" : "bg-[var(--line)] group-enabled:group-hover:bg-[var(--lime)] group-focus-visible:bg-[var(--lime)]"}`}
								/>
							</button>
						);
					})}

					{Array.from({ length: (size + 1) ** 2 }, (_, i) => (
						<span
							key={i}
							aria-hidden
							className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--ink)]"
							style={{ left: pad + (i % (size + 1)) * gap, top: pad + Math.floor(i / (size + 1)) * gap }}
						/>
					))}
				</div>

				<p className={`${label} min-h-4`} aria-live="polite">
					{status}
				</p>
			</div>

			<div className={`${mono} flex items-center justify-between border-t border-[var(--line)] px-4 py-2 text-xs uppercase tracking-widest`}>
				<button type="button" onClick={reset} className="hover:text-[var(--accent-ink)]">
					↺ New round
				</button>
				<a href="https://gamenight.omkararora.com" className="hover:text-[var(--accent-ink)]">
					More at Game Night ↗
				</a>
			</div>
		</div>
	);
}
