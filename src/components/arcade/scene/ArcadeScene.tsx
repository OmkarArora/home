"use client";

import { ContactShadows, MeshReflectorMaterial, OrbitControls, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ACESFilmicToneMapping, type CanvasTexture, type MeshStandardMaterial } from "three";

import { pixel } from "../pixelFont";
import type { Pressed } from "../useArcade";
import { Cabinet } from "./Cabinet";
import { CameraRig, ViewContext } from "./CameraRig";
import { Easel, Hologram, NeonHeart, StringLights, Underglow } from "./Props";
import { BackWall, NightSky, OpenSky, RecordCorner, TvCorner } from "./Room";
import { fitScreen } from "./screenFit";
import { Stickers } from "./Stickers";
import { drawNeon } from "./marquee";
import { type ViewKey, intro } from "./views";

/**
 * The Arcade at night: the cabinet on a dark floor with a sheen, a neon
 * ARCADE sign behind it, and a soft glow on the few things that give off
 * light. The camera is taken from view to view (`CameraRig`): click the
 * cabinet, the TV or the turntable to go there, drag to look about within
 * it. Nothing draws while the scene is off screen or the tab is hidden.
 */

/** Where the cabinet stands: out in the open under the sky, or in a room with a window on the night. */
export type Setting = "open" | "room";

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;

/** The wall sign's flicker: on, except two brief cuts every 6.4 s (as `.neon-stutter`). */
function neonLevel(seconds: number) {
	const t = (seconds % 6.4) / 6.4;
	return (t > 0.586 && t < 0.598) || (t > 0.612 && t < 0.624) ? 0.25 : 1;
}

function NeonWall() {
	const [texture, setTexture] = useState<CanvasTexture | null>(null);
	const sign = useRef<MeshStandardMaterial>(null);
	const still = useRef(false);

	useEffect(() => {
		still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		drawNeon(pixel.style.fontFamily).then(setTexture);
	}, []);

	useFrame(({ clock }) => {
		const level = still.current ? 1 : neonLevel(clock.elapsedTime);
		if (sign.current) sign.current.emissiveIntensity = 2.4 * level;
	});

	return (
		<group position={[0, 0, -1.4]}>
			{texture && (
				<mesh position={[0.95, 1.95, 0.02]}>
					<planeGeometry args={[1.5, 0.375]} />
					<meshStandardMaterial ref={sign} color="#000" emissive="#ffffff" emissiveMap={texture} transparent alphaMap={texture} toneMapped={false} />
				</mesh>
			)}
		</group>
	);
}

function Floor({ size }: { size: number }) {
	return (
		<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
			<planeGeometry args={[size, size]} />
			{/* A polished floor: a soft, low-resolution sheen of what's above it, not a mirror. */}
			<MeshReflectorMaterial
				blur={[300, 100]}
				resolution={512}
				mixBlur={0.8}
				mixStrength={12}
				mixContrast={1.15}
				roughness={0.55}
				depthScale={0.9}
				minDepthThreshold={0.3}
				maxDepthThreshold={1.4}
				color="#101118"
				metalness={0.7}
				mirror={0.5}
			/>
		</mesh>
	);
}


/** Says when everything inside the scene's Suspense has loaded. */
function Ready({ onReady }: { onReady: () => void }) {
	useEffect(onReady, []);
	return null;
}

/** Over the scene while the models load: how far along, in the arcade's lettering. Fades once they're in. */
function Loading({ ready }: { ready: boolean }) {
	const { progress } = useProgress();
	return (
		<div
			aria-hidden={ready}
			className={`pointer-events-none absolute inset-0 grid place-items-center bg-[#08080a] transition-opacity duration-700 motion-reduce:transition-none ${ready ? "opacity-0" : "opacity-100"}`}
		>
			<p className={`${pixel.className} text-xs text-[#c6f03a]`}>Loading {Math.round(progress)}%</p>
		</div>
	);
}

/** Keeps the live screen (a DOM element over the canvas) pinned to the glass. */
function ScreenTracker({ screen }: { screen: React.RefObject<HTMLDivElement | null> }) {
	useFrame(({ camera, size }) => {
		if (screen.current) fitScreen(screen.current, camera, size.width, size.height);
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
	children,
}: {
	setting?: Setting;
	/** Which viewpoint the camera is at or flying to, and how to ask for another. */
	view: ViewKey;
	/** Whether the machine's panel covers the right of the screen (the cabinet view slides over for it). */
	panel?: boolean;
	onView: (view: ViewKey) => void;
	onHover: (view: ViewKey | null) => void;
	/** Fill the parent (a full-screen view) instead of keeping a 16:10 frame. */
	full?: boolean;
	title: string;
	pressed: Pressed;
	tilt: -1 | 0 | 1;
	on: { prev: () => void; next: () => void; start: () => void; coin: () => void };
	/** The live screen, laid over the canvas and pinned to the glass. */
	screen: React.RefObject<HTMLDivElement | null>;
	children?: React.ReactNode;
}) {
	const box = useRef<HTMLDivElement>(null);
	const controls = useRef<OrbitControlsImpl | null>(null);
	const [ready, setReady] = useState(false);
	const ways = useMemo(() => ({ view, go: onView, hover: onHover }), [view, onView, onHover]);
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
		<div ref={box} className={`relative w-full overflow-hidden bg-[#08080a] ${full ? "h-full" : "aspect-[3/4] sm:aspect-[16/10]"}`}>
			<Canvas
				frameloop={running ? "always" : "never"}
				shadows
				dpr={[1, 2]}
				camera={{ position: intro, fov: 36, near: 0.05, far: 80 }}
				gl={{ antialias: true, toneMapping: ACESFilmicToneMapping }}
				// On touch screens a swipe over the scene scrolls the page, unless the scene is the whole page.
				style={{ touchAction: touch && !full ? "pan-y" : "none" }}
			>
				<color attach="background" args={["#08080a"]} />
				{/* In the open the floor runs on until the dark takes it: there's no edge to find. */}
				<fog attach="fog" args={["#08080a", setting === "open" ? 4.5 : 6, setting === "open" ? 12 : 14]} />
				{/* Few lights, each with a reason: a soft fill, a key from above right, and the cabinet's own spill
				    (marquee and screen). The moon, the underglow and the TV bring their own. */}
				<ambientLight intensity={0.2} />
				<spotLight position={[1.6, 3.4, 2.4]} angle={0.45} penumbra={0.9} intensity={32} color="#fff8ea" />
				<pointLight position={[0, 1.6, 0.5]} color="#e4f5c8" intensity={0.6} distance={1.6} decay={2} />
				<Suspense fallback={null}>
					<ViewContext.Provider value={ways}>
						<CameraRig view={view} controls={controls} panel={panel} />
						<Ready onReady={() => setReady(true)} />
						<Cabinet title={title} pressed={pressed} tilt={tilt} on={on} />
						<ScreenTracker screen={screen} />
						<NeonWall />
						<Stickers />
						<Underglow />
						<Hologram bump={pressed === "coin"} />
						{setting === "room" && <StringLights />}
						<NeonHeart />
						<Easel />
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
				</Suspense>
				{/* Limits come from the view (`CameraRig`); no panning, ever. */}
				<OrbitControls ref={controls} enablePan={false} enableZoom zoomSpeed={0.6} enableRotate={!touch || full} enableDamping dampingFactor={0.08} />
				<EffectComposer>
					<Bloom mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.2} intensity={0.7} />
					<Vignette offset={0.25} darkness={0.75} />
				</EffectComposer>
			</Canvas>
			{children}
			<Loading ready={ready} />
		</div>
	);
}
