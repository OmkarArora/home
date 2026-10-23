"use client";

import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { BoardingPass } from "./cards/BoardingPass";
import { FeelIt } from "./cards/FeelIt";
import { Mixtape } from "./cards/Mixtape";
import { Now } from "./cards/Now";
import { PlayRound } from "./cards/PlayRound";
import { Polaroids } from "./cards/Polaroids";
import { LocalTime } from "./LocalTime";
import { mono } from "./ui";

/**
 * The card beside the home page headline. Nine versions, compared with
 * `?card=1` to `?card=9`; every number on them is real.
 */

export type Player = {
	name: string;
	title: string;
	company: string;
	location: string;
	stack: string[];
	/** ISO date of the first full-time role. */
	careerStart: string;
	shipped: number;
	posts: number;
	sideQuests: number;
	photo: string;
	latestShip: { title: string; when: string };
	latestPost: { title: string; href: string };
	tracks: Array<{ side: "A" | "B" | "Bonus"; title: string; year: string }>;
	snaps: Array<{ src?: string; alt: string; caption: string }>;
};

const ease = [0.22, 1, 0.36, 1] as const;
const year = 365.25 * 24 * 60 * 60 * 1000;

export function PlayerCard({ player }: { player: Player }) {
	const [version, setVersion] = useState("1");
	useEffect(() => {
		const chosen = new URLSearchParams(window.location.search).get("card");
		if (chosen && /^[1-9]$/.test(chosen)) setVersion(chosen);
	}, []);

	switch (version) {
		case "2":
			return <LevelUp player={player} />;
		case "3":
			return <Terminal player={player} />;
		case "4":
			return <BoardingPass player={player} />;
		case "5":
			return <FeelIt />;
		case "6":
			return <PlayRound />;
		case "7":
			return <Now player={player} />;
		case "8":
			return <Polaroids player={player} />;
		case "9":
			return <Mixtape player={player} />;
		default:
			return <Holo player={player} />;
	}
}

/* ─── 1. Holo: a trading card that tilts toward the pointer ─── */

function Holo({ player }: { player: Player }) {
	const reduced = useReducedMotion();
	const x = useMotionValue(0.5);
	const y = useMotionValue(0.5);
	const spring = { stiffness: 200, damping: 20 };
	const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), spring);
	const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), spring);
	const glareX = useTransform(x, [0, 1], [0, 100]);
	const glareY = useTransform(y, [0, 1], [0, 100]);
	const sheen = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(198 240 58 / 0.35), transparent 55%)`;

	const move = (event: React.PointerEvent<HTMLDivElement>) => {
		if (reduced || event.pointerType !== "mouse") return;
		const box = event.currentTarget.getBoundingClientRect();
		x.set((event.clientX - box.left) / box.width);
		y.set((event.clientY - box.top) / box.height);
	};
	const leave = () => {
		x.set(0.5);
		y.set(0.5);
	};
	const level = Math.floor((Date.now() - new Date(player.careerStart).getTime()) / year);

	return (
		<div className="[perspective:1000px]" onPointerMove={move} onPointerLeave={leave}>
			<motion.div
				style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
				className="relative mx-auto max-w-sm border-2 border-[var(--ink)] bg-[var(--card)] p-3 shadow-[8px_8px_0_var(--lime)]"
			>
				<div className={`${mono} flex items-center justify-between px-1 pb-2 text-xs font-bold uppercase tracking-widest`}>
					<span>{player.name}</span>
					<span className="bg-[var(--lime)] px-1.5 py-0.5 text-[#0c0c0d]">LV {level}</span>
				</div>
				<div className="relative overflow-hidden border-2 border-[var(--ink)]">
					{/* eslint-disable-next-line @next/next/no-img-element -- a small fixed crop, not worth next/image here */}
					<img src={player.photo} alt={`${player.name} by a lake, Mt Fuji behind`} className="aspect-[4/3] w-full object-cover object-[50%_45%]" />
					<span className={`${mono} absolute bottom-2 left-2 bg-[var(--ink)] px-1.5 py-0.5 text-xs uppercase tracking-widest text-[var(--bg)]`}>
						{player.location.split(",")[0]}
					</span>
				</div>
				<p className={`${mono} mt-3 px-1 text-xs uppercase tracking-widest text-[var(--dim)]`}>
					{player.title} · {player.company}
				</p>
				<dl className={`${mono} mt-3 grid grid-cols-3 border-t-2 border-[var(--ink)] text-center`}>
					{[
						["Shipped", player.shipped],
						["Posts", player.posts],
						["Side quests", player.sideQuests],
					].map(([label, value]) => (
						<div key={label} className="border-r border-[var(--line)] pt-3 last:border-r-0">
							<dd className="text-2xl font-bold">{value}</dd>
							<dt className="mt-1 text-xs uppercase tracking-wider text-[var(--dim)]">{label}</dt>
						</div>
					))}
				</dl>
				<p className={`${mono} mt-3 border-t border-[var(--line)] px-1 pt-2 text-xs uppercase tracking-wider text-[var(--dim)]`}>
					Main: {player.stack.slice(0, 3).join(" / ")}
				</p>
				{/* The holographic sheen, following the pointer. */}
				<motion.div aria-hidden style={{ background: sheen }} className="pointer-events-none absolute inset-0 mix-blend-multiply dark:mix-blend-screen" />
			</motion.div>
		</div>
	);
}

/* ─── 2. Level up: years as a level, an XP bar to the next, real counts ─── */

function CountUp({ to, start }: { to: number; start: boolean }) {
	const reduced = useReducedMotion();
	const [value, setValue] = useState(to);
	useEffect(() => {
		if (!start || reduced) return;
		const controls = animate(0, to, { duration: 1.1, ease, onUpdate: (v) => setValue(Math.round(v)) });
		return () => controls.stop();
	}, [start, reduced, to]);
	return <>{value}</>;
}

function LevelUp({ player }: { player: Player }) {
	const ref = useRef<HTMLDivElement>(null);
	const seen = useInView(ref, { once: true });
	const reduced = useReducedMotion();
	const into = (Date.now() - new Date(player.careerStart).getTime()) / year;
	const level = Math.floor(into);
	const progress = into - level;

	return (
		<div ref={ref} className="border-2 border-[var(--ink)] bg-[var(--card)]">
			<div className={`${mono} flex items-center justify-between border-b-2 border-[var(--ink)] px-4 py-2 text-xs uppercase tracking-widest`}>
				<span>Player 1</span>
				<span className="flex items-center gap-2 text-[var(--dim)]">
					<span className="relative flex size-2">
						<span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--lime)] opacity-75 motion-reduce:animate-none" />
						<span className="relative inline-flex size-2 rounded-full bg-[var(--lime)]" />
					</span>
					Online · <LocalTime />
				</span>
			</div>

			<div className="flex items-end justify-between gap-4 p-4 sm:p-5">
				<div className="min-w-0">
					<p className="text-3xl leading-tight font-bold tracking-tight">{player.name}</p>
					<p className="mt-1 text-sm text-[var(--dim)]">
						{player.title} · {player.company}
					</p>
				</div>
				<div className={`${mono} shrink-0 text-right`}>
					<p className="text-xs uppercase tracking-widest text-[var(--dim)]">Level</p>
					<p className="text-5xl leading-none font-bold">{level}</p>
				</div>
			</div>

			<div className="px-4 pb-4 sm:px-5">
				<div className={`${mono} mb-1.5 flex justify-between text-xs uppercase tracking-widest text-[var(--dim)]`}>
					<span>XP to level {level + 1}</span>
					<span>{Math.round(progress * 100)}%</span>
				</div>
				<div className="h-3 border border-[var(--ink)] p-[2px]">
					<motion.div
						className="h-full origin-left bg-[var(--lime)]"
						initial={reduced ? false : { scaleX: 0 }}
						animate={{ scaleX: seen || reduced ? progress : 0 }}
						transition={{ duration: 1.2, ease, delay: 0.2 }}
					/>
				</div>
			</div>

			<dl className={`${mono} grid grid-cols-3 border-t-2 border-[var(--ink)] text-center`}>
				{[
					["Shipped", player.shipped],
					["Posts", player.posts],
					["Side quests", player.sideQuests],
				].map(([label, value]) => (
					<div key={label} className="border-r border-[var(--line)] px-2 py-3 last:border-r-0">
						<dd className="text-2xl font-bold">
							<CountUp to={value as number} start={seen} />
						</dd>
						<dt className="mt-1 text-xs uppercase tracking-wider text-[var(--dim)]">{label}</dt>
					</div>
				))}
			</dl>

			<div className={`${mono} flex flex-wrap gap-1.5 border-t border-[var(--line)] p-3 text-xs uppercase tracking-wider`}>
				<span className="py-1 pr-1 text-[var(--dim)]">Loadout</span>
				{player.stack.map((tool) => (
					<span key={tool} className="border border-[var(--line)] px-2 py-1">
						{tool}
					</span>
				))}
			</div>
		</div>
	);
}

/* ─── 3. Terminal: the card types itself out ─── */

function Terminal({ player }: { player: Player }) {
	const reduced = useReducedMotion();
	const months = Math.floor(((Date.now() - new Date(player.careerStart).getTime()) / year) * 12);
	const uptime = `${Math.floor(months / 12)} years, ${months % 12} months`;
	const lines: [string, string][] = [
		["whoami", player.name],
		["role", `${player.title} @ ${player.company}`],
		["location", player.location],
		["stack", player.stack.slice(0, 4).join(", ")],
		["uptime", uptime],
		["status", "shipping"],
	];
	const script = lines.flatMap(([cmd, out]) => [`$ ${cmd}`, out]);
	const total = script.reduce((sum, line) => sum + line.length, 0);
	const [typed, setTyped] = useState(total);
	const ref = useRef<HTMLDivElement>(null);
	const seen = useInView(ref, { once: true });

	useEffect(() => {
		if (reduced) return;
		setTyped(0);
	}, [reduced]);

	useEffect(() => {
		if (!seen || reduced || typed >= total) return;
		const timer = setTimeout(() => setTyped((n) => n + 1), 22);
		return () => clearTimeout(timer);
	}, [seen, reduced, typed, total]);

	let left = typed;
	const shown = script.map((line) => {
		const part = line.slice(0, Math.max(0, left));
		left -= line.length;
		return part;
	});

	return (
		<div ref={ref} className="border-2 border-[var(--ink)] bg-[#0c0c0d] text-[#ededE6]">
			<div className={`${mono} flex items-center gap-2 border-b border-white/15 px-4 py-2 text-xs uppercase tracking-widest text-white/50`}>
				<span className="size-2.5 rounded-full bg-[var(--lime)]" />
				<span className="size-2.5 rounded-full bg-white/20" />
				<span className="size-2.5 rounded-full bg-white/20" />
				<span className="ml-2">omkar@web ~ zsh</span>
			</div>
			<div className={`${mono} min-h-[19rem] p-4 text-sm leading-relaxed sm:p-5`} aria-label={lines.map(([c, o]) => `${c}: ${o}`).join(". ")}>
				{shown.map((text, i) =>
					text || i === 0 ? (
						<p key={i} aria-hidden className={i % 2 === 0 ? "text-white/50" : i === script.length - 1 ? "text-[var(--lime)]" : ""}>
							{i % 2 === 0 ? <span className="text-[var(--lime)]">{text.slice(0, 1)}</span> : null}
							{i % 2 === 0 ? text.slice(1) : text}
						</p>
					) : null,
				)}
				<span aria-hidden className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[var(--lime)] motion-reduce:animate-none" />
			</div>
		</div>
	);
}
