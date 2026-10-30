"use client";

import { useEffect, useRef, useState } from "react";

import { pixel } from "../pixelFont";
import type { Stage, SummonApi, WishKind } from "./DragonBalls";

/**
 * The words over the summon: a Skip while it builds, then the dragon's question and four
 * wishes to pick from, and his answer. One is beyond even him: he says so, and waits for another.
 * Esc skips ahead while it builds.
 */

const wishes = (neon: boolean): { kind: WishKind; label: string }[] => [
	{ kind: "credits", label: "Endless credits" },
	{ kind: "sky", label: neon ? "Give me back the twilight" : "Paint the night neon" },
	{ kind: "bugs", label: "Fix all my bugs" },
	{ kind: "maker", label: "Meet the one who made this" },
];

const glow = { textShadow: "0 0 12px rgb(255 170 60 / 0.9), 0 0 32px rgb(255 120 30 / 0.6)" };

export function Wish({ stage, api, neon }: { stage: Stage; api: React.RefObject<SummonApi | null>; neon: boolean }) {
	const first = useRef<HTMLButtonElement>(null);
	// Asked for the one he can't grant (it's struck off for the rest of this summon).
	const [refused, setRefused] = useState(false);
	if (stage === "off" && refused) setRefused(false);
	const building = stage === "hush" || stage === "glow" || stage === "strike" || stage === "arrive";

	useEffect(() => {
		if (stage === "stare") first.current?.focus();
	}, [stage]);
	useEffect(() => {
		if (!building) return;
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			api.current?.skip();
		};
		document.addEventListener("keydown", onKey, true);
		return () => document.removeEventListener("keydown", onKey, true);
	}, [building, api]);

	if (stage === "off") return null;
	return (
		<div className="pointer-events-none absolute inset-0 z-20">
			<style>{"@keyframes wish-in { from { opacity: 0; transform: translateY(8px); } }"}</style>
			{building && (
				<button
					type="button"
					onClick={() => api.current?.skip()}
					className={`${pixel.className} pointer-events-auto absolute right-4 bottom-4 border border-[rgb(237_237_230/0.2)] bg-[rgb(11_11_12/0.5)] px-3 py-2 text-[10px] text-[#a9a9a2] backdrop-blur-sm hover:border-[#ededE6] hover:text-[#ededE6]`}
				>
					Skip ›
				</button>
			)}
			{stage === "stare" && (
				<div role="dialog" aria-label="Make a wish" className="absolute inset-0 animate-[wish-in_1.4s_ease-out]">
					{/* His words up in the sky over him; the wishes along the bottom. */}
					<p
						key={refused ? "refused" : "ask"}
						aria-live="polite"
						className={`${pixel.className} absolute inset-x-4 top-[9%] animate-[wish-in_0.6s_ease-out] text-center text-[13px] leading-relaxed text-[#ffd68a] sm:text-[18px]`}
						style={glow}
					>
						{refused ? "That is beyond my power." : "You who gathered the seven balls."}
						<br />
						{refused ? "Speak another wish." : "Speak your wish."}
					</p>
					<div className="pointer-events-auto absolute inset-x-4 bottom-[7%] flex flex-wrap justify-center gap-2">
						{wishes(neon)
							.filter((w) => !(refused && w.kind === "bugs"))
							.map((w, i) => (
							<button
								key={w.kind}
								ref={i === 0 ? first : undefined}
								type="button"
								onClick={() => {
									if (w.kind === "bugs") {
										setRefused(true);
										first.current?.focus();
									}
									api.current?.wish(w.kind);
								}}
								className={`${pixel.className} border border-[rgb(255_200_120/0.45)] bg-[rgb(20_12_4/0.6)] px-3.5 py-2.5 text-[10px] text-[#ffe2b0] backdrop-blur-sm transition-colors hover:border-[#ffd68a] hover:bg-[rgb(60_34_8/0.7)] focus-visible:border-[#ffd68a] focus-visible:outline-none sm:text-[11px]`}
							>
								{w.label}
							</button>
						))}
					</div>
				</div>
			)}
			{stage === "grant" && (
				<p
					role="status"
					className={`${pixel.className} absolute inset-x-4 top-[9%] animate-[wish-in_0.6s_ease-out] text-center text-[13px] leading-relaxed text-[#ffd68a] sm:text-[17px]`}
					style={glow}
				>
					Your wish has been granted.
					<br />
					Farewell.
				</p>
			)}
		</div>
	);
}
