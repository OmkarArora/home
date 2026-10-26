"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { setSoundOn, useSoundOn } from "@/components/site/sound";
import { label, mono } from "@/components/site/ui";

import { Crt } from "./Crt";
import { Retro } from "./layouts/Retro";
import { MachineInfo } from "./MachineInfo";
import { pixel } from "./pixelFont";
import type { Setting } from "./scene/ArcadeScene";
import { size } from "./scene/screenSize";
import { type ViewKey, hints } from "./scene/views";
import { useArcade } from "./useArcade";

/**
 * The Arcade: a 3D cabinet out under the night sky, the machine live on its
 * screen. Click the cabinet, the TV or the turntable and the camera takes you
 * there; Back (or Esc) brings you out again. The machine's knobs sit beside it. The 3D (three.js and the model) loads only here, after
 * the page; under reduced motion, without WebGL, or with data saver on, the
 * drawn cabinet stands in, with the same machines and controls.
 */

const ArcadeScene = dynamic(() => import("./scene/ArcadeScene"), {
	ssr: false,
	loading: () => <Loading />,
});

function Loading() {
	return (
		// Full screen (inside the fixed wrapper) it fills the window, so the words don't jump when the scene's own loader takes over.
		<div className="grid aspect-[3/4] w-full place-items-center bg-[#08080a] sm:aspect-[16/10] in-[.fixed]:aspect-auto in-[.fixed]:h-full">
			<p className={`${pixel.className} text-xs text-[#c6f03a]`}>Loading 0%</p>
		</div>
	);
}

/** The buttons floating over the scene: dark glass, lime on hover. */
const hud = "flex h-9 items-center border border-[rgb(237_237_230/0.2)] bg-[rgb(11_11_12/0.7)] text-[10px] text-[#ededE6] backdrop-blur-sm hover:border-[#c6f03a] hover:text-[#c6f03a]";

function canRun3d() {
	const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
	if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
	try {
		return !!document.createElement("canvas").getContext("webgl2");
	} catch {
		return false;
	}
}

/** Real buttons for the cabinet's controls, for keyboards and screen readers (and anyone). */
function Controls({ move, start, coin, startRef }: Pick<ReturnType<typeof useArcade>, "move" | "start" | "coin" | "startRef">) {
	const button = `${mono} border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-[var(--ink)]`;
	return (
		<div className="flex flex-wrap items-center gap-2">
			<button type="button" data-sfx="none" className={button} onClick={() => move(-1)} aria-label="Previous machine">
				◀
			</button>
			<button type="button" data-sfx="none" className={button} onClick={() => move(1)} aria-label="Next machine">
				▶
			</button>
			<button ref={startRef} type="button" data-sfx="none" className={`${button} bg-[var(--lime)] text-[#0c0c0d]`} onClick={start} aria-label="Pause: all machines">
				Start
			</button>
			<button type="button" data-sfx="none" className={button} onClick={coin}>
				Insert coin
			</button>
			<span className={`${label} ml-auto hidden sm:inline`}>Drag to look around · press the cabinet&apos;s buttons</span>
		</div>
	);
}

function Scene3d({ full = false, setting }: { full?: boolean; setting?: Setting }) {
	const { at, machine, pressed, tilt, move, start, coin, startRef, menu, paused } = useArcade();
	const [view, setView] = useState<ViewKey>("wide");
	const [hint, setHint] = useState<ViewKey | null>(null);
	const go = useCallback((to: ViewKey) => {
		setHint(null);
		setView(to);
	}, []);
	const soundOn = useSoundOn();
	// Full screen, the machine's panel only shows up close to the cabinet.
	const panel = full && view === "cabinet";

	// Esc steps back out to the wide view (the pause menu has Esc to itself while it's open).
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape" && !paused && view !== "wide") go("wide");
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [paused, view, go]);
	const screen = useRef<HTMLDivElement>(null);
	const [screenSlot, setScreenSlot] = useState<HTMLDivElement | null>(null);
	const [knobSlot, setKnobSlot] = useState<HTMLDivElement | null>(null);
	const { Play } = machine;

	return (
		<div className={full ? "fixed inset-0 z-40 bg-[#08080a]" : "pb-16"}>
			<ArcadeScene full={full} setting={setting} view={view} panel={panel} onView={go} onHover={setHint} title={machine.name} pressed={pressed} tilt={tilt} on={{ prev: () => move(-1), next: () => move(1), start, coin }} screen={screen}>
				{/* The live screen: laid out flat at the glass's size, then pinned onto it each frame. */}
				<div
					ref={(el) => {
						screen.current = el;
						setScreenSlot(el);
					}}
					className="absolute top-0 left-0 origin-top-left"
					// Hidden until the first frame pins it to the glass (`fitScreen` shows it), so it never flashes up flat.
					style={{ width: size.w, height: size.h, visibility: "hidden" }}
				/>
				<div className="absolute top-4 left-4 flex gap-2">
					{view !== "wide" && (
						<button type="button" onClick={() => go("wide")} className={`${pixel.className} ${hud} px-3`}>
							◀ Back
						</button>
					)}
					{/* Full screen covers the site's own switch: the record player needs one to be heard. */}
					{full && (
						<button
							type="button"
							role="switch"
							aria-checked={soundOn}
							aria-label="Sound"
							title={soundOn ? "Sound on" : "Sound off"}
							data-sfx="none"
							onClick={() => setSoundOn(!soundOn)}
							className={`${hud} w-9 justify-center`}
						>
							<svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
								<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
								{soundOn ? <path d="M16.5 9.5a3.5 3.5 0 0 1 0 5M19 7a7 7 0 0 1 0 10" /> : <path d="M17 10l4 4m0-4l-4 4" />}
							</svg>
						</button>
					)}
				</div>
				{(view === "wide" || view === "records") && (
					<p
						aria-live="polite"
						className={`${pixel.className} pointer-events-none absolute bottom-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 bg-[rgb(11_11_12/0.6)] px-3 py-2 leading-relaxed text-center text-[10px] text-[#c6f03a] backdrop-blur-sm`}
					>
						{view === "records"
							? `Click the record player to play or stop it${soundOn ? "" : " · turn sound on to hear it"}`
							: hint && hint !== "wide"
								? hints[hint]
								: "Click the cabinet to play · drag to look round"}
					</p>
				)}
			</ArcadeScene>
			{/* The machine renders here, but its screen and knobs are portalled into the cabinet and the column. */}
			<Play
				key={machine.key}
				layout={(screen, knobs) => (
					<>
						{screenSlot &&
							createPortal(
								<Crt channel={machine.key} className="size-full">
									{screen}
								</Crt>,
								screenSlot,
							)}
						{knobSlot && createPortal(knobs, knobSlot)}
					</>
				)}
			/>
			{full ? (
				// Full screen: the machine's panel floats over the scene, top right, once you're at the cabinet; it scrolls by itself.
				<aside
					aria-hidden={!panel}
					inert={!panel}
					className={`absolute top-4 right-4 bottom-4 transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none ${panel ? "" : "pointer-events-none translate-x-[110%] opacity-0"} w-[min(22rem,calc(100%-2rem))] overflow-y-auto border border-[rgb(237_237_230/0.14)] bg-[rgb(11_11_12/0.82)] p-5 text-[#ededE6] backdrop-blur-md [--accent-ink:#c6f03a] [--dim:#8a8a84] [--ink:#ededE6] [--line:rgb(237_237_230/0.14)]`}
				>
					<Controls move={move} start={start} coin={coin} startRef={startRef} />
					<div className="mt-6">
						<MachineInfo at={at} machine={machine} knobs={<div ref={setKnobSlot} />} />
					</div>
				</aside>
			) : (
				<>
					<div className="mt-4">
						<Controls move={move} start={start} coin={coin} startRef={startRef} />
					</div>
					<div className="mt-10 max-w-3xl">
						<MachineInfo at={at} machine={machine} knobs={<div ref={setKnobSlot} />} />
					</div>
				</>
			)}
			{menu}
		</div>
	);
}

export function Arcade({ full = false, setting }: { full?: boolean; setting?: Setting }) {
	const [mode, setMode] = useState<"3d" | "2d" | null>(null);
	useEffect(() => setMode(canRun3d() ? "3d" : "2d"), []);
	if (mode === null) return <Loading />;
	return mode === "3d" ? <Scene3d full={full} setting={setting} /> : <Retro style="illustrated" />;
}
