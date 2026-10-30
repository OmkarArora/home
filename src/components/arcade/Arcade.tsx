"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { setSoundOn, soundTurnedOff, useSoundOn } from "@/components/site/sound";
import { label, mono } from "@/components/site/ui";

import { Credits } from "./Credits";
import { Crt, darkTheme } from "./Crt";
import { Retro } from "./layouts/Retro";
import { MachineInfo } from "./MachineInfo";
import { type Button, ButtonsContext, GameContext } from "./machines/kit";
import { pixel } from "./pixelFont";
import type { Setting } from "./scene/ArcadeScene";
import { type PaletteName, palettes, savePalette, startPalette } from "./scene/palette";
import { startAmbience } from "./scene/ambience";
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
function Controls({
	move,
	start,
	coin,
	startRef,
	expand,
	begin,
	credits,
}: Pick<ReturnType<typeof useArcade>, "move" | "start" | "coin" | "startRef"> & {
	/** With a cabinet that takes credits: START spends one (`begin`), and how many there are. */
	begin?: () => void;
	credits?: number;
	/** Open the machine out flat beside the panel, and the button that does it (focus comes back to it). */
	expand?: { open: () => void; ref: React.Ref<HTMLButtonElement> };
}) {
	const button = `${mono} border border-[var(--line)] px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-[var(--ink)]`;
	return (
		<div className="flex flex-wrap items-center gap-2">
			<button type="button" data-sfx="none" className={button} onClick={() => move(-1)} aria-label="Previous machine">
				◀
			</button>
			<button type="button" data-sfx="none" className={button} onClick={() => move(1)} aria-label="Next machine">
				▶
			</button>
			{begin ? (
				<>
					<button type="button" data-sfx="none" className={`${button} bg-[var(--lime)] text-[#0c0c0d]`} onClick={begin} aria-label={`Start: play (credits: ${credits ?? 0})`}>
						Start
					</button>
					<button type="button" data-sfx="none" className={button} onClick={coin}>
						Insert coin
					</button>
					<button ref={startRef} type="button" data-sfx="none" className={`${button} order-2`} onClick={start} aria-label="All machines" title="All machines">
						☰
					</button>
				</>
			) : (
				<>
					<button ref={startRef} type="button" data-sfx="none" className={`${button} bg-[var(--lime)] text-[#0c0c0d]`} onClick={start} aria-label="Pause: all machines">
						Start
					</button>
					<button type="button" data-sfx="none" className={button} onClick={coin}>
						Insert coin
					</button>
				</>
			)}
			{expand && (
				// Its own row, full width and lit: the easiest way to actually play a machine.
				<button
					ref={expand.ref}
					type="button"
					onClick={expand.open}
					className={`${mono} order-1 flex grow basis-[calc(100%-3.5rem)] items-center justify-center gap-2 border border-[var(--accent-ink)] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-ink)] hover:bg-[var(--accent-ink)] hover:text-[#0c0c0d]`}
				>
					<span aria-hidden>⤢</span> Expand to play
				</button>
			)}
			<span className={`${label} order-3 ml-auto hidden sm:inline`}>Drag to look around · press the cabinet&apos;s buttons</span>
		</div>
	);
}

function Scene3d({ full = false, setting }: { full?: boolean; setting?: Setting }) {
	const { at, machine, pressed, tilt, move, start, coin, fill, startRef, menu, paused, credits, begin, game, broke } = useArcade();
	// The marquee's last line: the machine, and the credits (or INSERT COIN, flashing, when START had none).
	const marquee = broke ? "insert coin" : credits > 0 ? `${machine.name} · ${credits === 1 ? "credit" : "credits"} ${credits}` : machine.name;
	// The way in is an Enter button: its click lets the browser play sound, and it turns the site's
	// sound on (unless the visitor has switched it off before; the switch stays top left).
	// The first time someone comes, the opening follows: the record player close up, the arm swinging
	// over and the needle dropping, a few bars, then a slow pull back to show the whole arcade. After
	// that, visits open on the whole arcade with the record already playing. Anything the visitor
	// does first (a click, Esc) cuts the opening short.
	const [first] = useState(() => {
		try {
			return localStorage.getItem("arcade-visited") === null;
		} catch {
			return false;
		}
	});
	const [entered, setEntered] = useState(false);
	const [view, setView] = useState<ViewKey>(first ? "records" : "wide");
	const [intro, setIntro] = useState(first);
	const [record, setRecord] = useState(!first);
	const [hint, setHint] = useState<ViewKey | null>(null);
	const [said, setSaid] = useState<string | null>(null);
	// The machine on screen hands over its buttons (`useButtons`); the cabinet presses them.
	const buttons = useRef<Button[] | null>(null);
	const giveButtons = useCallback((list: Button[] | null) => {
		buttons.current = list;
	}, []);
	const timers = useRef<number[]>([]);
	const later = (ms: number, then: () => void) => timers.current.push(window.setTimeout(then, ms));
	const endIntro = useCallback(() => {
		for (const t of timers.current) window.clearTimeout(t);
		timers.current = [];
		setIntro(false);
	}, []);
	useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
	const go = useCallback(
		(to: ViewKey) => {
			endIntro();
			setHint(null);
			setView(to);
		},
		[endIntro],
	);
	const toggleRecord = useCallback(() => {
		endIntro();
		setRecord((on) => !on);
	}, [endIntro]);
	const enter = () => {
		if (!soundTurnedOff()) setSoundOn(true);
		setEntered(true);
		try {
			localStorage.setItem("arcade-visited", "1");
		} catch {}
		if (!first) return;
		// As the gate fades: drop the needle; the arm takes about two seconds to swing over and set down.
		later(700, () => setRecord(true));
		// A few bars of the record, then the reveal (the slow flight); the opening ends once it's under way.
		later(5600, () => {
			setHint(null);
			setView("wide");
			later(100, () => setIntro(false));
		});
	};
	const soundOn = useSoundOn();
	// The sound bed (hum, room tone, crickets) while you're in with sound on.
	useEffect(() => {
		if (!entered || !soundOn) return;
		return startAmbience();
	}, [entered, soundOn]);
	// Phones get shorter hints (and "tap", not "click").
	const [touch, setTouch] = useState(false);
	useEffect(() => setTouch(window.matchMedia("(pointer: coarse)").matches), []);
	// The scene's colours: Twilight unless switched (top left), remembered here.
	const [paletteName, setPaletteName] = useState<PaletteName>(startPalette);
	const palette = palettes[paletteName];
	const { sky } = palette;
	const router = useRouter();
	const switchPalette = () => {
		const next = paletteName === "twilight" ? "synthwave" : "twilight";
		setPaletteName(next);
		savePalette(next);
	};
	// Full screen, the machine's panel only shows up close to the cabinet.
	const panel = full && view === "cabinet";

	// Expanded: the machine opened out flat in a box beside the panel, the arcade behind it.
	// Closes with × or Esc (focus back on Expand), and on leaving the cabinet.
	const [expanded, setExpanded] = useState(false);
	const [expandSlot, setExpandSlot] = useState<HTMLDivElement | null>(null);
	const expandButton = useRef<HTMLButtonElement>(null);
	const closeExpanded = useCallback(() => {
		setExpanded(false);
		requestAnimationFrame(() => expandButton.current?.focus());
	}, []);
	useEffect(() => {
		if (!panel) setExpanded(false);
	}, [panel]);

	// Esc steps back out to the wide view (the pause menu has Esc to itself while it's open).
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || !entered || paused) return;
			if (expanded) closeExpanded();
			else if (view !== "wide") go("wide");
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [entered, paused, view, go, expanded, closeExpanded]);
	const screen = useRef<HTMLDivElement>(null);
	const [screenSlot, setScreenSlot] = useState<HTMLDivElement | null>(null);
	const [knobSlot, setKnobSlot] = useState<HTMLDivElement | null>(null);
	const { Play } = machine;

	return (
		<div className={full ? "fixed inset-0 z-[70]" : "pb-16"} style={full ? { background: sky } : undefined}>
			<ArcadeScene full={full} setting={setting} view={view} panel={panel} onView={go} onHover={setHint} onSay={setSaid} onCoin={coin} onWish={(kind) => (kind === "credits" ? fill() : kind === "sky" ? switchPalette() : kind === "maker" ? router.push("/about") : undefined)} record={record} onRecord={toggleRecord} slow={intro} entered={entered} onEnter={enter} live={!expanded} palette={palette} title={marquee} pressed={pressed} tilt={tilt} on={{
					prev: () => move(-1),
					next: () => move(1),
					start: begin,
					coin,
					button: (n) => buttons.current?.[n]?.press(),
					label: (n) => buttons.current?.[n]?.label ?? null,
				}} screen={screen}>
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
				<div className={`absolute top-4 left-4 flex gap-2 ${entered ? "" : "hidden"}`}>
					{/* Out of the Arcade, back to the rest of the site. */}
					{full && (
						<a href="/" className={`${pixel.className} ${hud} px-3`} aria-label="Leave the Arcade: back to the site">
							⌂ Site
						</a>
					)}
					{view !== "wide" && !intro && (
						<button type="button" onClick={() => go("wide")} className={`${pixel.className} ${hud} px-3`}>
							◀ Back
						</button>
					)}
					{/* The scene's colours: two swatches of the other palette, to switch to it. */}
					{full && (
						<button
							type="button"
							onClick={switchPalette}
							aria-label={`Colours: ${paletteName === "twilight" ? "Twilight" : "Synthwave"}. Switch to ${paletteName === "twilight" ? "Synthwave" : "Twilight"}`}
							title={`Switch to ${paletteName === "twilight" ? "Synthwave" : "Twilight"}`}
							className={`${hud} w-9 justify-center`}
						>
							<span aria-hidden className="flex">
								{palettes[paletteName === "twilight" ? "synthwave" : "twilight"].pools.map((colour) => (
									<span key={colour} className="size-2.5 rounded-full" style={{ background: colour, boxShadow: `0 0 6px ${colour}` }} />
								))}
							</span>
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
				{entered && !intro && (view === "wide" || view === "records" || (view === "cabinet" && said)) && (
					<p
						aria-live="polite"
						className={`${pixel.className} pointer-events-none absolute bottom-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] left-1/2 max-w-[calc(100%-2rem)] -translate-x-1/2 bg-[rgb(11_11_12/0.6)] px-3 py-2 leading-relaxed text-center text-[10px] text-[#c6f03a] backdrop-blur-sm`}
					>
						{view === "cabinet"
							? said
							: view === "records"
								? `${touch ? "Tap" : "Click"} the record player to play or stop it${soundOn ? "" : " · turn sound on to hear it"}`
								: (said ??
									(hint && hint !== "wide"
										? hints[hint]
										: touch
											? "Tap the cabinet to play"
											: "Click the cabinet to play · grab the coin · drag to look round"))}
					</p>
				)}
				{entered && !panel && <Credits className="absolute top-4 right-4 sm:top-auto sm:bottom-[max(1rem,env(safe-area-inset-bottom))]" />}
			</ArcadeScene>
			{/* The machine renders here, but its screen and knobs are portalled into the cabinet and the column. */}
			<ButtonsContext.Provider value={giveButtons}>
			<GameContext.Provider value={game}>
				<Play
					key={machine.key}
					layout={(screen, knobs) => (
						<>
							{expanded && expandSlot
								? createPortal(screen, expandSlot)
								: screenSlot &&
									createPortal(
										<Crt channel={machine.key} className="size-full" corners="5% / 7%">
											{screen}
										</Crt>,
										screenSlot,
									)}
							{knobSlot && createPortal(knobs, knobSlot)}
						</>
					)}
				/>
			</GameContext.Provider>
			</ButtonsContext.Provider>
			{full && expanded && (
				// The machine opened out: the space left of the panel (all of it on a phone), dark like the panel.
				<section
					aria-label={`${machine.name}, opened out`}
					style={darkTheme}
					className="absolute inset-0 z-20 flex flex-col border sm:inset-4 sm:z-10 border-[rgb(237_237_230/0.14)] bg-[rgb(11_11_12/0.92)] backdrop-blur-md sm:right-[calc(min(22rem,100%-2rem)+2rem)]"
				>
					<header className="flex items-center justify-between border-b border-[rgb(237_237_230/0.14)] px-4 py-3">
						<p className={`${pixel.className} text-[11px] text-[#c6f03a]`}>{machine.name}</p>
						<button
							type="button"
							onClick={closeExpanded}
							aria-label="Close"
							className="grid size-8 place-items-center border border-[rgb(237_237_230/0.2)] text-[#ededE6] hover:border-[#c6f03a] hover:text-[#c6f03a]"
						>
							×
						</button>
					</header>
					{/* The machine fills the box, whatever height it asked for. */}
					<div
						ref={(el) => {
							setExpandSlot(el);
							el?.focus();
						}}
						tabIndex={-1}
						className="relative min-h-0 flex-1 outline-none [&>*]:!aspect-auto [&>*]:size-full [&>*]:!min-h-0"
					/>
				</section>
			)}
			{full ? (
				// Full screen: the machine's panel floats over the scene, top right, once you're at the cabinet; it scrolls by itself.
				<aside
					aria-hidden={!panel}
					inert={!panel}
					// On a phone, a sheet along the bottom; from tablets up, a column on the right.
					className={`absolute inset-x-0 bottom-0 max-h-[46dvh] pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:max-h-none sm:w-[min(22rem,calc(100%-2rem))] transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none ${panel ? "" : "pointer-events-none translate-y-full opacity-0 sm:translate-y-0 sm:translate-x-[110%]"} overflow-y-auto border border-[rgb(237_237_230/0.14)] bg-[rgb(11_11_12/0.82)] p-5 text-[#ededE6] backdrop-blur-md [--accent-ink:#c6f03a] [--dim:#8a8a84] [--ink:#ededE6] [--line:rgb(237_237_230/0.14)]`}
				>
					<Controls
						move={move}
						start={start}
						coin={coin}
						startRef={startRef}
						begin={begin}
						credits={credits}
						expand={{ open: () => setExpanded(true), ref: expandButton }}
					/>
					<div className="mt-6">
						<MachineInfo at={at} machine={machine} knobs={<div ref={setKnobSlot} />} />
					</div>
				</aside>
			) : (
				<>
					<div className="mt-4">
						<Controls move={move} start={start} coin={coin} startRef={startRef} begin={begin} credits={credits} />
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
