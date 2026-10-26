"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box3, type CanvasTexture, Color, type Mesh, MeshBasicMaterial, MeshStandardMaterial, type Object3D, Vector3 } from "three";

import { pixel } from "../pixelFont";
import type { Pressed } from "../useArcade";
import { useView } from "./CameraRig";
import { drawAttract, drawMarquee, lime } from "./marquee";
import { isTap } from "./views";

/**
 * The cabinet: JewelPodd's model (CC BY 4.0, prepared by `pnpm arcade:model`)
 * in the site's colours. Matte black body, glowing lime buttons and sticks,
 * lit coin slots, and a backlit marquee. The controls take clicks; anywhere
 * else on it takes you up close to play. The live machine is laid over the
 * screen from outside the canvas (`screenFit.ts`).
 */

const url = "/models/arcade-cabinet.glb";

/** Bright enough to pass the glow's threshold: emissive colours are pushed over 1. */
const glowing = (hex: string, strength: number) => new Color(hex).multiplyScalar(strength);

function materials(marquee: CanvasTexture | null, attract: CanvasTexture | null) {
	const matte = (hex: string, roughness = 0.6, metalness = 0.1) => new MeshStandardMaterial({ color: hex, roughness, metalness });
	const lit = (hex: string, strength: number) => new MeshStandardMaterial({ color: hex, emissive: glowing(hex, strength), roughness: 0.35, toneMapped: false });
	return {
		body: matte("#0d0d10", 0.5),
		sides: matte("#141418", 0.45),
		deck: matte("#1a1a1f", 0.55),
		back: matte("#0d0d10"),
		trim: matte("#1a1a1f"),
		speakers: matte("#09090b", 0.8, 0.4),
		screen: new MeshStandardMaterial({ color: "#020203", emissive: "#ffffff", emissiveMap: attract, emissiveIntensity: attract ? 0.9 : 0, roughness: 0.08, metalness: 0.2 }),
		marquee: new MeshStandardMaterial({ color: "#000", emissive: "#ffffff", emissiveMap: marquee, emissiveIntensity: 1.6, toneMapped: false }),
		"coin-door": matte("#2a2a30", 0.35, 0.7),
		"coin-locks": matte("#c9c9c2", 0.25, 0.9),
		"coin-returns": matte("#0b0b0d", 0.5),
		"coin-slots": lit(lime, 2.2),
		"button-rings": matte("#060607", 0.4),
		"stick-bases": matte("#060607", 0.4),
		"stick-shafts": matte("#d8d8d2", 0.2, 1),
		stick: lit(lime, 1.6),
		button: lit(lime, 1.3),
		start: lit("#f3f3ee", 1.2),
	} as Record<string, MeshStandardMaterial>;
}

/** What a part does when it's clicked, if anything. */
function action(name: string): "prev" | "next" | "start" | "coin" | "stick" | "select" | null {
	if (name === "p1-button-1") return "prev";
	if (name === "p1-button-2") return "next";
	if (name.endsWith("-start")) return "start";
	if (name === "coin-slots") return "coin";
	if (name.endsWith("-stick")) return "stick";
	if (name.includes("-button-")) return "select";
	return null;
}

export function Cabinet({
	title,
	pressed,
	tilt,
	on,
}: {
	title: string;
	pressed: Pressed;
	tilt: -1 | 0 | 1;
	on: { prev: () => void; next: () => void; start: () => void; coin: () => void };
}) {
	const { scene } = useGLTF(url, false);
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

	const mats = useMemo(() => materials(marquee, attract), [marquee, attract]);
	// Where each part sits, so pressed buttons and leaning sticks can move from it and back.
	const home = useRef(new Map<string, [number, number, number]>());

	useEffect(() => {
		scene.traverse((o: Object3D) => {
			const mesh = o as Mesh;
			if (!mesh.isMesh) return;
			const name = mesh.name;
			const kind = name.endsWith("-stick") ? "stick" : name.endsWith("-start") ? "start" : name.includes("-button-") ? "button" : name;
			mesh.material = mats[kind] ?? mats.trim;
			mesh.castShadow = true;
			if (!home.current.has(name)) home.current.set(name, [mesh.position.x, mesh.position.y, mesh.position.z]);
		});
	}, [scene, mats]);

	// Show the pressed control: a button sinks a few millimetres, the stick leans.
	useEffect(() => {
		const sink = { prev: "p1-button-1", next: "p1-button-2", start: "p1-start", coin: null }[pressed ?? "coin"];
		scene.traverse((o) => {
			const start = home.current.get(o.name);
			if (!start) return;
			o.position.set(...start);
			if (o.name === sink) o.position.y -= 0.004;
			if (o.name === "p1-stick") o.position.x += tilt * 0.012;
		});
	}, [scene, pressed, tilt]);

	// The buttons are a few centimetres across: each control gets a larger invisible zone to hit.
	const zones = useMemo(() => {
		const list: { name: string; centre: Vector3; size: Vector3 }[] = [];
		scene.traverse((o) => {
			if (!(o as Mesh).isMesh || !action(o.name)) return;
			const bounds = new Box3().setFromObject(o);
			const pad = o.name === "coin-slots" ? 0.02 : 0.012;
			list.push({ name: o.name, centre: bounds.getCenter(new Vector3()), size: bounds.getSize(new Vector3()).addScalar(pad * 2) });
		});
		return list;
	}, [scene]);
	const invisible = useMemo(() => new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), []);

	const { view, go, hover: hint } = useView();
	const click = (event: ThreeEvent<MouseEvent>) => {
		if (!isTap(event)) return;
		const what = action(event.object.name);
		event.stopPropagation();
		// Anywhere else on the cabinet takes you up to it to play.
		if (!what) {
			if (view !== "cabinet") go("cabinet");
			return;
		}
		if (what === "stick") {
			// Left of the stick goes back, right goes on.
			const centre = event.object.getWorldPosition(new Vector3());
			(event.point.x < centre.x ? on.prev : on.next)();
		} else if (what === "select") on.next();
		else on[what]();
	};
	const [hover, setHover] = useState(false);
	useEffect(() => {
		document.body.style.cursor = hover ? "pointer" : "";
		return () => {
			document.body.style.cursor = "";
		};
	}, [hover]);

	return (
		<group>
			<primitive
				object={scene}
				onClick={click}
				onPointerOver={(e: ThreeEvent<PointerEvent>) => {
					e.stopPropagation();
					const control = action(e.object.name) !== null;
					setHover(control || view !== "cabinet");
					hint(control || view === "cabinet" ? null : "cabinet");
				}}
				onPointerOut={() => {
					setHover(false);
					hint(null);
				}}
			/>
			{zones.map((zone) => (
				<mesh
					key={zone.name}
					name={zone.name}
					position={zone.centre}
					material={invisible}
					onClick={click}
					onPointerOver={() => setHover(true)}
					onPointerOut={() => setHover(false)}
				>
					<boxGeometry args={[zone.size.x, zone.size.y, zone.size.z]} />
				</mesh>
			))}
		</group>
	);
}

useGLTF.preload(url, false);
