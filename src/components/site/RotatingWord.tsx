"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * The home page headline's lime word, which changes every few seconds.
 *
 * - The server renders the first word, so it is right before any script runs.
 * - Screen readers only ever hear the first word: the changing copy is hidden
 *   from them, and the headline carries the first word as visually hidden text.
 * - It stays on the first word under reduced motion, pauses in a hidden tab,
 *   and pauses while the pointer is over it.
 * - The lime block eases to each word's width, so nothing around it jumps.
 *
 * Three ways for the words to change, compared with `?word=roll|flap|scramble`.
 */

type Style = "roll" | "flap" | "scramble";

const every = 2800;
const ease = [0.22, 1, 0.36, 1] as const;

export function RotatingWord({ words }: { words: string[] }) {
	const reduced = useReducedMotion();
	const [index, setIndex] = useState(0);
	const [style, setStyle] = useState<Style>("roll");
	const [paused, setPaused] = useState(false);
	const [widths, setWidths] = useState<number[]>([]);
	const sizers = useRef<(HTMLSpanElement | null)[]>([]);
	const word = words[index];

	useEffect(() => {
		const chosen = new URLSearchParams(window.location.search).get("word");
		if (chosen === "flap" || chosen === "scramble") setStyle(chosen);
	}, []);

	// Each word's width at the headline's current size, which changes with the window.
	useLayoutEffect(() => {
		const measure = () => setWidths(sizers.current.map((el) => el?.offsetWidth ?? 0));
		measure();
		const observer = new ResizeObserver(measure);
		const headline = sizers.current[0]?.closest("h1");
		if (headline) observer.observe(headline);
		document.fonts?.ready.then(measure);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (reduced || paused) return;
		let timer: number | undefined;
		const start = () => {
			timer = window.setInterval(() => setIndex((i) => (i + 1) % words.length), every);
		};
		const onVisibility = () => {
			window.clearInterval(timer);
			if (!document.hidden) start();
		};
		start();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [reduced, paused, words.length]);

	return (
		<span
			aria-hidden
			className="relative inline-block"
			onPointerEnter={() => setPaused(true)}
			onPointerLeave={() => setPaused(false)}
		>
			{/* Invisible copies of every word, to measure. */}
			<span className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap">
				{words.map((w, i) => (
					<span key={w} ref={(el) => void (sizers.current[i] = el)} className="absolute top-0 left-0">
						{w}
					</span>
				))}
			</span>

			<motion.span
				className="relative inline-block whitespace-nowrap"
				initial={false}
				animate={widths[index] ? { width: widths[index] } : undefined}
				transition={{ duration: 0.5, ease }}
			>
				<span className="absolute inset-x-[-0.08em] bottom-[0.08em] top-[0.18em] -skew-x-6 bg-[var(--lime)]" />
				<span className="relative block text-[#0c0c0d]">
					{style === "roll" && <Roll word={word} />}
					{style === "flap" && <Flap word={word} />}
					{style === "scramble" && <Scramble word={word} />}
				</span>
			</motion.span>
		</span>
	);
}

/** 1. The word rolls up and out as the next one rolls in, like an odometer. */
function Roll({ word }: { word: string }) {
	return (
		// Padded and pulled back so the clip leaves room for ascenders and descenders.
		<span className="relative block overflow-clip pt-[0.1em] -mt-[0.1em] pb-[0.14em] -mb-[0.14em]">
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span
					key={word}
					className="block"
					initial={{ y: "100%" }}
					animate={{ y: "0%" }}
					exit={{ y: "-100%" }}
					transition={{ duration: 0.55, ease }}
				>
					{word}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}

/** 2. Letters flip over one after another, like a departure board. */
function Flap({ word }: { word: string }) {
	return (
		<span className="relative block [perspective:600px]">
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.span key={word} className="flex">
					{[...word].map((letter, i) => (
						<motion.span
							key={i}
							className="inline-block origin-[50%_55%] [backface-visibility:hidden]"
							initial={{ rotateX: 90, opacity: 0 }}
							animate={{ rotateX: 0, opacity: 1 }}
							exit={{ rotateX: -90, opacity: 0 }}
							transition={{ duration: 0.3, delay: i * 0.045, ease }}
						>
							{letter}
						</motion.span>
					))}
				</motion.span>
			</AnimatePresence>
		</span>
	);
}

/** 3. Letters shuffle through random characters and settle, left to right. */
function Scramble({ word }: { word: string }) {
	const [shown, setShown] = useState(word);
	const first = useRef(true);

	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		const pool = "abcdefghijklmnopqrstuvwxyz";
		const controls = animate(0, 1, {
			duration: 0.7,
			ease: "linear",
			onUpdate: (progress) => {
				const settled = Math.floor(progress * (word.length + 2)) - 2;
				setShown(
					[...word]
						.map((letter, i) => (i <= settled ? letter : pool[Math.floor(Math.random() * pool.length)]))
						.join(""),
				);
			},
			onComplete: () => setShown(word),
		});
		return () => controls.stop();
	}, [word]);

	return <span className="block overflow-clip">{shown}</span>;
}
