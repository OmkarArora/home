"use client";

import { ContactShadows, MeshReflectorMaterial, OrbitControls, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ACESFilmicToneMapping, AdditiveBlending, CanvasTexture } from "three";

import { pixel } from "../pixelFont";
import type { Pressed } from "../useArcade";
import { Cabinet } from "./Cabinet";
import { DragonBalls, type Stage, type SummonApi, type WishKind } from "./DragonBalls";
import { CameraRig, ViewContext } from "./CameraRig";
import { Hologram, NeonPair, Sandwich, StringLights, Underglow } from "./Props";
import { KatakanaSign, Lanterns, Sakura } from "./Japan";
import { BackWall, NightSky, OpenSky, RecordCorner, TvCorner } from "./Room";
import { fitScreen } from "./screenFit";
import { Stickers } from "./Stickers";
import { Wish } from "./Wish";
import { type Palette, PaletteContext, palettes, usePalette } from "./palette";
import { type ViewKey, views } from "./views";

/**
 * The Arcade at night: the cabinet on a dark floor with a sheen, a neon
 * alien and heart floating behind it, and a soft glow on the few things that give off
 * light. The camera is taken from view to view (`CameraRig`): click the
 * cabinet, the TV or the turntable to go there, drag to look about within
 * it. Nothing draws while the scene is off screen or the tab is hidden.
 */

/** Where the cabinet stands: out in the open under the sky, or in a room with a window on the night. */
export type Setting = "open" | "room";

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;


/** A soft round pool of light, painted (white, tinted by its material's colour). */
const poolTexture = () => {
	const canvas = Object.assign(document.createElement("canvas"), { width: 256, height: 256 });
	const ctx = canvas.getContext("2d");
	if (ctx) {
		const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
		g.addColorStop(0, "rgb(255 255 255 / 0.36)");
		g.addColorStop(0.35, "rgb(255 255 255 / 0.15)");
		g.addColorStop(0.7, "rgb(255 255 255 / 0.04)");
		g.addColorStop(1, "rgb(255 255 255 / 0)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 256, 256);
	}
	return new CanvasTexture(canvas);
};

function Floor({ size }: { size: number }) {
	const { floor, pools } = usePalette();
	const pool = useMemo(poolTexture, []);
	return (
		<group>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
				<planeGeometry args={[size, size]} />
				{/* A glossy floor: a soft, low-resolution reflection of what's above it, tinted by the night. */}
				<MeshReflectorMaterial
					blur={[160, 60]}
					resolution={512}
					mixBlur={0.55}
					mixStrength={30}
					mixContrast={1.1}
					roughness={0.4}
					depthScale={0.9}
					minDepthThreshold={0.3}
					maxDepthThreshold={1.4}
					color={floor}
					metalness={0.6}
					mirror={0.75}
				/>
			</mesh>
			{/* Two big pools of neon on the floor, one under each side, like light spilling from signs. */}
			{([
				[-1.9, 0.6, pools[0]],
				[2.0, 0.2, pools[1]],
			] as const).map(([x, z, colour]) => (
				<mesh key={colour} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
					<planeGeometry args={[5.2, 5.2]} />
					<meshBasicMaterial map={pool} color={colour} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
				</mesh>
			))}
		</group>
	);
}

/** Says when everything inside the scene's Suspense has loaded. */
function Ready({ onReady }: { onReady: () => void }) {
	useEffect(onReady, []);
	return null;
}

/**
 * The way in, over the scene: how far the models have loaded, then an Enter button. Its click is
 * also what lets the browser play sound, so the record is heard from its first note.
 */
function Gate({ ready, entered, onEnter }: { ready: boolean; entered: boolean; onEnter: () => void }) {
	const { progress } = useProgress();
	return (
		<div
			aria-hidden={entered}
			inert={entered}
			className={`absolute inset-0 grid place-items-center bg-[#08080a] transition-opacity duration-700 motion-reduce:transition-none ${entered ? "pointer-events-none opacity-0" : "opacity-100"}`}
		>
			{ready ? (
				<div className="flex flex-col items-center gap-6 px-4 text-center">
					<p className={`${pixel.className} text-[10px] tracking-widest text-[#8a8a84]`}>Omkar&apos;s</p>
					<p className={`${pixel.className} -mt-3 text-2xl text-[#c6f03a] sm:text-3xl`}>Arcade</p>
					<button
						type="button"
						data-sfx="none"
						// The gate is the whole page here: focus starts on the way in, so Enter just goes in.
						autoFocus
						onClick={onEnter}
						className={`${pixel.className} border border-[#c6f03a] bg-[#c6f03a] px-6 py-3 text-[11px] tracking-wide text-[#0c0c0d] hover:bg-[#d6ff52] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f03a]`}
					>
						Enter
					</button>
				</div>
			) : (
				<p className={`${pixel.className} text-xs text-[#c6f03a]`}>Loading {Math.round(progress)}%</p>
			)}
		</div>
	);
}

/** Keeps the live screen (a DOM element over the canvas) pinned to the glass. */
function ScreenTracker({ screen, interactive }: { screen: React.RefObject<HTMLDivElement | null>; interactive: boolean }) {
	useFrame(({ camera, size }) => {
		if (screen.current) fitScreen(screen.current, camera, size.width, size.height, interactive);
	});
	return null;
}

export default function ArcadeScene({
	title,
	pressed,
	tilt,
	on,
	screen,
	full = false,
	setting = "open",
	view,
	panel = false,
	onView,
	onHover,
	onSay,
	onCoin,
	onWish,
	record = false,
	onRecord,
	onArrive,
	entered,
	onEnter,
	live = true,
	slow = false,
	palette,
	children,
}: {
	setting?: Setting;
	/** Which viewpoint the camera is at or flying to, and how to ask for another. */
	view: ViewKey;
	/** Whether the machine's panel covers the right of the screen (the cabinet view slides over for it). */
	panel?: boolean;
	onView: (view: ViewKey) => void;
	onHover: (view: ViewKey | null) => void;
	/** What a hovered control does, for the HUD. */
	onSay: (text: string | null) => void;
	/** A coin in: from the hologram's coin, grabbed. */
	onCoin: () => void;
	/** A wish the dragon granted. */
	onWish: (kind: WishKind) => void;
	/** Whether the record player is playing, and the switch for it. */
	record?: boolean;
	onRecord: () => void;
	/** Called as the camera lands on a view; `slow` makes the next flight a slow one. */
	onArrive?: (view: ViewKey) => void;
	slow?: boolean;
	/** Whether the visitor has come in through the gate, and what happens when they do. */
	entered: boolean;
	onEnter: () => void;
	/** Whether the live machine is on the cabinet's glass (not while it's opened out). */
	live?: boolean;
	/** The scene's colours. */
	palette: Palette;
	/** Fill the parent (a full-screen view) instead of keeping a 16:10 frame. */
	full?: boolean;
	title: string;
	pressed: Pressed;
	tilt: -1 | 0 | 1;
	on: { prev: () => void; next: () => void; start: () => void; coin: () => void; button: (n: number) => void; label: (n: number) => string | null };
	/** The live screen, laid over the canvas and pinned to the glass. */
	screen: React.RefObject<HTMLDivElement | null>;
	children?: React.ReactNode;
}) {
	const box = useRef<HTMLDivElement>(null);
	const controls = useRef<OrbitControlsImpl | null>(null);
	// The dragon takes the camera while he flies, then hands it back to fly home.
	const cinematic = useRef(false);
	const [again, setAgain] = useState(0);
	const [stage, setStage] = useState<Stage>("off");
	const summonApi = useRef<SummonApi | null>(null);
	const [ready, setReady] = useState(false);

	const ways = useMemo(
		() => ({ view, go: onView, hover: onHover, say: onSay, record, toggleRecord: onRecord, coin: onCoin }),
		[view, onView, onHover, onSay, record, onRecord, onCoin],
	);
	const [running, setRunning] = useState(true);
	const [touch, setTouch] = useState(false);

	// Draw only while on screen and the tab is visible.
	useEffect(() => {
		const el = box.current;
		if (!el) return;
		let seen = true;
		const update = () => setRunning(seen && !document.hidden);
		const observer = new IntersectionObserver(([entry]) => {
			seen = entry.isIntersecting;
			update();
		});
		observer.observe(el);
		document.addEventListener("visibilitychange", update);
		setTouch(window.matchMedia("(pointer: coarse)").matches);
		return () => {
			observer.disconnect();
			document.removeEventListener("visibilitychange", update);
		};
	}, []);

	return (
		<div ref={box} style={{ background: palette.sky }} className={`relative w-full overflow-hidden ${full ? "h-full" : "aspect-[3/4] sm:aspect-[16/10]"}`}>
			<Canvas
				frameloop={running ? "always" : "never"}
				shadows
				dpr={[1, 2]}
				camera={{ position: views.wide.position, fov: 36, near: 0.05, far: 80 }}
				gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}
				// On touch screens a swipe over the scene scrolls the page, unless the scene is the whole page.
				style={{ touchAction: touch && !full ? "pan-y" : "none" }}
			>
				<color attach="background" args={[palette.sky]} />
				{/* In the open the floor runs on until the dark takes it: there's no edge to find. */}
				<fog attach="fog" args={[palette.sky, setting === "open" ? 4.5 : 6, setting === "open" ? 12 : 14]} />
				{/* Few lights, each with a reason: a soft fill, a key from above right, and the cabinet's own spill
				    (marquee and screen). The moon, the underglow and the TV bring their own. */}
				<ambientLight intensity={0.2} />
				<spotLight position={[1.6, 3.4, 2.4]} angle={0.45} penumbra={0.9} intensity={26} color={palette.key} />
				<pointLight position={[0, 1.6, 0.5]} color="#e4f5c8" intensity={0.6} distance={1.6} decay={2} />
				<Suspense fallback={null}>
					<PaletteContext.Provider value={palette}>
					<ViewContext.Provider value={ways}>
						<CameraRig view={view} controls={controls} panel={panel} slow={slow} onArrive={onArrive} hold={cinematic} again={again} />
						<Ready onReady={() => setReady(true)} />
						<Cabinet title={title} pressed={pressed} tilt={tilt} on={on} live={live} />
						<ScreenTracker screen={screen} interactive={view === "cabinet"} />
						<Stickers />
						<Underglow />
						<Hologram bump={pressed === "coin"} />
						{setting === "room" && <StringLights />}
						{/* Out in the open, the street's own sign and lanterns take the place of the alien and heart. */}
						{setting === "room" && <NeonPair />}
						{setting === "open" && <KatakanaSign />}
						{setting === "open" && <Lanterns stage={stage} />}
						{setting === "open" && <Sakura stage={stage} />}
						<Sandwich />
						<DragonBalls
							controls={controls}
							hold={cinematic}
							onStage={setStage}
							api={summonApi}
							onWish={onWish}
							open={setting === "open"}
							onDone={() => {
								onView("wide");
								setAgain((n) => n + 1);
							}}
						/>
						{setting === "room" ? (
							<>
								<BackWall />
								<NightSky />
							</>
						) : (
							<OpenSky />
						)}
						<TvCorner />
						<RecordCorner />
						<Floor size={setting === "open" ? 80 : 12} />
						<ContactShadows position={[0, 0.002, 0]} opacity={0.7} scale={3} blur={2.4} far={1.2} />
					</ViewContext.Provider>
					</PaletteContext.Provider>
				</Suspense>
				{/* Limits come from the view (`CameraRig`); no panning, ever. */}
				<OrbitControls ref={controls} enablePan={false} enableZoom zoomSpeed={0.6} enableRotate={!touch || full} enableDamping dampingFactor={0.08} />
				<EffectComposer>
					{/* Soft and wide: a haze round the lights rather than a glare. */}
					<Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.3} intensity={0.55} radius={0.85} />
					<Vignette offset={0.3} darkness={0.55} />
				</EffectComposer>
			</Canvas>
			{/* The HUD steps aside while the dragon's here. */}
			<div className={`transition-opacity duration-700 ${stage === "off" ? "" : "pointer-events-none opacity-0"}`}>{children}</div>
			<Wish stage={stage} api={summonApi} neon={palette === palettes.synthwave} />
			<Gate ready={ready} entered={entered} onEnter={onEnter} />
		</div>
	);
}
