"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, type CanvasTexture, Color, Group, type Mesh, MeshBasicMaterial, MeshStandardMaterial, type Object3D, Vector3 } from "three";

import { pixel } from "../pixelFont";
import type { Pressed } from "../useArcade";
import { useView } from "./CameraRig";
import { liveOpacity } from "./screenFit";
import { drawAttract, drawMarquee, lime } from "./marquee";
import { type Palette, usePalette } from "./palette";
import { isTap } from "./views";

/**
 * The cabinet: JewelPodd's model (CC BY 4.0, prepared by `pnpm arcade:model`):
 * a matte black body, arcade-coloured buttons and sticks that glow, lit coin
 * slots and a backlit marquee. Every control does its own thing: the sticks
 * change machine (and lean as a whole), START opens the list, player 2's
 * white button is a coin, and the coloured buttons are the machine's own
 * (`useButtons`). Anywhere else on it takes you up close to play. The live
 * machine is laid over the screen from outside the canvas (`screenFit.ts`).
 */

const url = "/models/arcade-cabinet.glb";

/** Bright enough to pass the glow's threshold: emissive colours are pushed over 1. */
const glowing = (hex: string, strength: number) => new Color(hex).multiplyScalar(strength);

function materials(marquee: CanvasTexture | null, attract: CanvasTexture | null, palette: Palette) {
	const matte = (hex: string, roughness = 0.6, metalness = 0.1) => new MeshStandardMaterial({ color: hex, roughness, metalness });
	const lit = (hex: string, strength: number) => new MeshStandardMaterial({ color: hex, emissive: glowing(hex, strength), roughness: 0.35, toneMapped: false });
	return {
		body: matte("#0d0d10", 0.5),
		sides: matte("#141418", 0.45),
		deck: matte("#1a1a1f", 0.55),
		back: matte("#0d0d10"),
		trim: matte("#1a1a1f"),
		speakers: matte("#09090b", 0.8, 0.4),
		// Matte and as dark as the live screen's tube, so nothing lit shows past its corners.
		screen: new MeshStandardMaterial({ color: "#0b0b0c", emissive: "#ffffff", emissiveMap: attract, emissiveIntensity: attract ? 0.9 : 0, roughness: 0.92, metalness: 0 }),
		marquee: new MeshStandardMaterial({ color: "#000", emissive: "#ffffff", emissiveMap: marquee, emissiveIntensity: 1.6, toneMapped: false }),
		"coin-door": matte("#2a2a30", 0.35, 0.7),
		"coin-locks": matte("#c9c9c2", 0.25, 0.9),
		"coin-returns": matte("#0b0b0d", 0.5),
		"coin-slots": lit(lime, 2.2),
		"button-rings": matte("#060607", 0.4),
		"stick-bases": matte("#060607", 0.4),
		shaft: matte("#d8d8d2", 0.2, 1),
		stick: lit(palette.stick, 1.5),
		start: lit("#f3f3ee", 1.2),
		...Object.fromEntries(palette.buttons.map((hex, i) => [`button-${i + 1}`, lit(hex, 1.3)])),
	} as Record<string, MeshStandardMaterial>;
}

/** The material a part wears: by its kind, so each player's matching parts look alike. */
function kindOf(name: string) {
	if (name.endsWith("-stick")) return "stick";
	if (name.endsWith("-shaft")) return "shaft";
	if (name.endsWith("-start")) return "start";
	return name.match(/^p[12]-(button-\d)$/)?.[1] ?? name;
}

type Control = { does: "stick"; side: "p1" | "p2" } | { does: "start" } | { does: "coin" } | { does: "button"; n: number };

/** What a part does when it's clicked, if anything. */
function control(name: string): Control | null {
	if (name === "coin-slots") return { does: "coin" };
	const m = name.match(/^(p[12])-(stick|start|button-(\d))$/);
	if (!m) return null;
	const side = m[1] as "p1" | "p2";
	if (m[2] === "stick") return { does: "stick", side };
	if (m[2] === "start") return side === "p1" ? { does: "start" } : { does: "coin" };
	return { does: "button", n: (side === "p2" ? 6 : 0) + Number(m[3]) - 1 };
}

/** Each stick's ball and shaft, hung from a pivot at the top of its base so the whole stick leans. Built once per model. */
function buildSticks(scene: Object3D) {
	scene.updateMatrixWorld(true);
	const sticks: Partial<Record<"p1" | "p2", Group>> = {};
	for (const side of ["p1", "p2"] as const) {
		const ball = scene.getObjectByName(`${side}-stick`);
		const shaft = scene.getObjectByName(`${side}-shaft`);
		if (!ball || !shaft) continue;
		const bounds = new Box3().setFromObject(shaft);
		const pivot = new Group();
		pivot.position.copy(scene.worldToLocal(new Vector3((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2)));
		scene.add(pivot);
		pivot.updateMatrixWorld(true);
		pivot.attach(ball);
		pivot.attach(shaft);
		sticks[side] = pivot;
	}
	return sticks;
}

export function Cabinet({
	title,
	pressed,
	tilt,
	on,
	live = true,
}: {
	/** Whether the live machine is on the glass (not while it's opened out in the expand panel). */
	live?: boolean;
	title: string;
	pressed: Pressed;
	tilt: -1 | 0 | 1;
	on: { prev: () => void; next: () => void; start: () => void; coin: () => void; button: (n: number) => void; label: (n: number) => string | null };
}) {
	const { scene } = useGLTF(url, false);
	const palette = usePalette();
	const [marquee, setMarquee] = useState<CanvasTexture | null>(null);
	const [attract, setAttract] = useState<CanvasTexture | null>(null);
	const family = pixel.style.fontFamily;

	useEffect(() => {
		let live = true;
		drawMarquee(marquee, family, title).then((texture) => live && texture && setMarquee(texture));
		drawAttract(attract, family, title).then((texture) => live && texture && setAttract(texture));
		return () => {
			live = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps -- redraw onto the same texture when the title changes
	}, [title, family]);

	const mats = useMemo(() => materials(marquee, attract, palette), [marquee, attract, palette]);
	const sticks = useMemo(() => (scene.userData.sticks ??= buildSticks(scene)) as ReturnType<typeof buildSticks>, [scene]);
	// Where each button sits, so a pressed one can sink and come back.
	const home = useRef(new Map<string, number>());

	useEffect(() => {
		scene.traverse((o: Object3D) => {
			const mesh = o as Mesh;
			if (!mesh.isMesh) return;
			mesh.material = mats[kindOf(mesh.name)] ?? mats.trim;
			mesh.castShadow = true;
			if (/-(start|button-\d)$/.test(mesh.name) && !home.current.has(mesh.name)) home.current.set(mesh.name, mesh.position.y);
		});
	}, [scene, mats]);

	// The button being pressed sinks a few millimetres: the one clicked, or START from the keyboard.
	const [sunk, setSunk] = useState<string | null>(null);
	const sinkTimer = useRef<number | undefined>(undefined);
	const sink = (name: string) => {
		window.clearTimeout(sinkTimer.current);
		setSunk(name);
		sinkTimer.current = window.setTimeout(() => setSunk(null), 160);
	};
	useEffect(() => {
		const down = sunk ?? (pressed === "start" ? "p1-start" : null);
		for (const [name, y] of home.current) {
			const part = scene.getObjectByName(name);
			if (part) part.position.y = name === down ? y - 0.004 : y;
		}
	}, [scene, sunk, pressed]);

	// The sticks lean the way they're pushed: player 1's with the arrow keys and ◀ ▶ too.
	const lean = useRef({ p1: 0, p2: 0 });
	const pushTimer = useRef<number | undefined>(undefined);
	const [push, setPush] = useState<{ side: "p1" | "p2"; way: -1 | 1 } | null>(null);
	useFrame(({ camera }, dt) => {
		// The attract screen glows on the glass only where the live screen isn't: turned away, or moved off the cabinet.
		mats.screen.emissiveIntensity = attract ? 0.9 * (live ? 1 - liveOpacity(camera) : 1) : 0;
		for (const side of ["p1", "p2"] as const) {
			// Only the stick that was pushed leans; the arrow keys and ◀ ▶ lean player 1's.
			const goal = push ? (push.side === side ? push.way : 0) : side === "p1" ? tilt : 0;
			lean.current[side] += (goal - lean.current[side]) * Math.min(1, dt * 18);
			const pivot = sticks[side];
			if (pivot) pivot.rotation.z = -lean.current[side] * 0.35;
		}
	});

	// The buttons are a few centimetres across: each control gets a larger invisible zone to hit.
	const zones = useMemo(() => {
		const list: { name: string; centre: Vector3; size: Vector3 }[] = [];
		scene.updateMatrixWorld(true);
		scene.traverse((o) => {
			if (!(o as Mesh).isMesh || !control(o.name)) return;
			const bounds = new Box3().setFromObject(o);
			const pad = o.name === "coin-slots" ? 0.02 : 0.012;
			list.push({ name: o.name, centre: bounds.getCenter(new Vector3()), size: bounds.getSize(new Vector3()).addScalar(pad * 2) });
		});
		return list;
	}, [scene]);
	const invisible = useMemo(() => new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), []);

	const { view, go, hover: hint, say } = useView();
	const click = (event: ThreeEvent<MouseEvent>) => {
		if (!isTap(event)) return;
		const name = event.object.name;
		const c = control(name);
		event.stopPropagation();
		// Anywhere else on the cabinet takes you up to it to play.
		if (!c) {
			if (view !== "cabinet") go("cabinet");
			return;
		}
		if (c.does === "stick") {
			// Left of the stick goes back, right goes on; it leans that way for a moment.
			const centre = event.object.getWorldPosition(new Vector3());
			const way = event.point.x < centre.x ? -1 : 1;
			window.clearTimeout(pushTimer.current);
			setPush({ side: c.side, way });
			pushTimer.current = window.setTimeout(() => setPush(null), 200);
			(way < 0 ? on.prev : on.next)();
			return;
		}
		if (name !== "coin-slots") sink(name);
		if (c.does === "button") on.button(c.n);
		else on[c.does]();
	};
	/** What hovering a control says, in the HUD. */
	const describe = (name: string) => {
		const c = control(name);
		if (!c) return null;
		if (c.does === "stick") return "Joystick: change machine";
		if (c.does === "start") return "Start: play (uses a credit)";
		if (c.does === "coin") return "Insert coin";
		return `P${c.n < 6 ? 1 : 2} · ${(c.n % 6) + 1} · ${on.label(c.n) ?? "nothing here"}`;
	};
	const [hover, setHover] = useState(false);
	useEffect(() => {
		document.body.style.cursor = hover ? "pointer" : "";
		return () => {
			document.body.style.cursor = "";
		};
	}, [hover]);
	const over = (name: string) => {
		const control = describe(name);
		setHover(control !== null || view !== "cabinet");
		hint(control || view === "cabinet" ? null : "cabinet");
		say(control);
	};
	const out = () => {
		setHover(false);
		hint(null);
		say(null);
	};

	return (
		<group>
			<primitive
				object={scene}
				onClick={click}
				onPointerOver={(e: ThreeEvent<PointerEvent>) => {
					e.stopPropagation();
					over(e.object.name);
				}}
				onPointerOut={out}
			/>
			{zones.map((zone) => (
				<mesh
					key={zone.name}
					name={zone.name}
					position={zone.centre}
					material={invisible}
					onClick={click}
					onPointerOver={(e: ThreeEvent<PointerEvent>) => {
						e.stopPropagation();
						over(zone.name);
					}}
					onPointerOut={out}
				>
					<boxGeometry args={[zone.size.x, zone.size.y, zone.size.z]} />
				</mesh>
			))}
		</group>
	);
}

useGLTF.preload(url, false);
