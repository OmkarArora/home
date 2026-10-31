"use client";

import { Billboard, useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";

import { useSoundOn } from "@/components/site/sound";
import {
	AdditiveBlending,
	Box3,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Group,
	type Mesh,
	type MeshStandardMaterial,
	Object3D,
	PlaneGeometry,
	type PointLight,
	SRGBColorSpace,
	Vector3,
} from "three";

import { useView } from "./CameraRig";
import { lime } from "./marquee";
import { cyan } from "./Props";
import { tvBlip } from "./ambience";
import { startRecord } from "./recordMusic";
import { anchors, isTap, stand } from "./views";

/**
 * The rest of the room: the back wall with a window onto a night sky and a
 * full moon, a TV corner (a CRT on a low stand, a PlayStation beside it,
 * playing a little game), and a record player spinning on a side table.
 * The TV, record player and console are from Sketchfab (CC BY 4.0, prepared
 * by `pnpm arcade:props`, credited on the page).
 */

const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
	const canvas = Object.assign(document.createElement("canvas"), { width, height });
	const ctx = canvas.getContext("2d");
	if (ctx) draw(ctx);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

/** The back wall, with a window cut in it on the left. */
const wall = { z: -1.4, width: 8, height: 4 };
const opening = { x0: -2.35, x1: -1.25, y0: 1.05, y1: 2.35 };

export function BackWall() {
	const panels = useMemo(() => {
		const { width, height } = wall;
		const [left, right] = [-width / 2, width / 2];
		const { x0, x1, y0, y1 } = opening;
		// Four panels round the opening: [centre x, centre y, width, height].
		return [
			[(left + x0) / 2, height / 2, x0 - left, height],
			[(x1 + right) / 2, height / 2, right - x1, height],
			[(x0 + x1) / 2, y0 / 2, x1 - x0, y0],
			[(x0 + x1) / 2, (y1 + height) / 2, x1 - x0, height - y1],
		];
	}, []);
	const { x0, x1, y0, y1 } = opening;
	const frame = 0.05;
	return (
		<group position={[0, 0, wall.z]}>
			{panels.map(([x, y, w, h], i) => (
				<mesh key={i} position={[x, y, 0]} castShadow>
					<planeGeometry args={[w, h]} />
					<meshStandardMaterial color="#09090b" roughness={0.95} />
				</mesh>
			))}
			{/* The frame, the bars and the sill. */}
			{[
				[(x0 + x1) / 2, y1, x1 - x0 + frame * 2, frame],
				[(x0 + x1) / 2, y0, x1 - x0 + frame * 2, frame],
				[x0, (y0 + y1) / 2, frame, y1 - y0],
				[x1, (y0 + y1) / 2, frame, y1 - y0],
				[(x0 + x1) / 2, (y0 + y1) / 2, 0.025, y1 - y0],
				[(x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, 0.025],
			].map(([x, y, w, h], i) => (
				<mesh key={i} position={[x, y, 0.02]} castShadow>
					<boxGeometry args={[w, h, 0.06]} />
					<meshStandardMaterial color="#1b1b20" roughness={0.6} metalness={0.3} />
				</mesh>
			))}
			<mesh position={[(x0 + x1) / 2, y0 - 0.02, 0.08]}>
				<boxGeometry args={[x1 - x0 + 0.2, 0.03, 0.16]} />
				<meshStandardMaterial color="#1b1b20" roughness={0.6} />
			</mesh>
		</group>
	);
}

/** A full moon drawn by hand, and the soft halo of light round it. */
function useMoon() {
	// A pale disc, darker seas, a few craters, shaded at the rim.
	const moon = useMemo(
		() =>
			canvasTexture(512, 512, (ctx) => {
				const r = 250;
				ctx.translate(256, 256);
				const base = ctx.createRadialGradient(-60, -60, 40, 0, 0, r);
				base.addColorStop(0, "#fbfaf2");
				base.addColorStop(0.8, "#dedbcf");
				base.addColorStop(1, "#b9b6ab");
				ctx.fillStyle = base;
				ctx.beginPath();
				ctx.arc(0, 0, r, 0, Math.PI * 2);
				ctx.fill();
				ctx.save();
				ctx.clip();
				ctx.filter = "blur(10px)";
				ctx.fillStyle = "rgb(120 118 112 / 0.45)";
				for (const [x, y, s] of [
					[-70, -60, 70],
					[30, -90, 55],
					[60, 10, 80],
					[-20, 60, 50],
					[-110, 30, 40],
					[110, 90, 35],
				])
					ctx.beginPath(), ctx.ellipse(x, y, s, s * 0.8, 0.4, 0, Math.PI * 2), ctx.fill();
				ctx.filter = "none";
				ctx.strokeStyle = "rgb(110 108 100 / 0.35)";
				ctx.lineWidth = 3;
				for (let i = 0; i < 28; i++) {
					const a = Math.random() * Math.PI * 2;
					const d = Math.random() * r * 0.9;
					ctx.beginPath();
					ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 4 + Math.random() * 14, 0, Math.PI * 2);
					ctx.stroke();
				}
				ctx.restore();
			}),
		[],
	);

	const halo = useMemo(
		() =>
			canvasTexture(256, 256, (ctx) => {
				const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
				g.addColorStop(0, "rgb(200 215 255 / 0.55)");
				g.addColorStop(0.35, "rgb(150 175 255 / 0.18)");
				g.addColorStop(1, "rgb(120 150 255 / 0)");
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, 256, 256);
			}),
		[],
	);
	return { moon, halo };
}

/** Where the moonlight comes from (high outside, beyond the window) and where it lands, in front of the cabinet on the left. */
const moonlight = { from: [-3.4, 3.4, -4.6] as const, to: [-0.9, 0, 1.0] as const };

/** The night outside: a deep blue sky full of stars, and a full moon far off, so it shifts with depth as you walk round. */
export function NightSky() {
	const sky = useMemo(
		() =>
			canvasTexture(1024, 512, (ctx) => {
				const g = ctx.createLinearGradient(0, 0, 0, 512);
				g.addColorStop(0, "#04060f");
				g.addColorStop(1, "#0d1630");
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, 1024, 512);
				for (let i = 0; i < 420; i++) {
					const r = Math.random();
					ctx.fillStyle = `rgb(255 255 255 / ${0.25 + r * 0.7})`;
					ctx.fillRect(Math.random() * 1024, Math.random() * 512, r > 0.95 ? 2 : 1, r > 0.95 ? 2 : 1);
				}
			}),
		[],
	);
	const { moon, halo } = useMoon();
	const moonTarget = useMemo(() => {
		const o = new Object3D();
		o.position.set(...moonlight.to);
		return o;
	}, []);

	return (
		<group>
			<mesh position={[-2, 2.2, -9]}>
				<planeGeometry args={[18, 9]} />
				<meshBasicMaterial map={sky} fog={false} />
			</mesh>
			{/* The moon, bright enough to bloom, in a soft halo of its own light. */}
			<mesh position={[-5.1, 2.05, -8.55]}>
				<planeGeometry args={[4.2, 4.2]} />
				<meshBasicMaterial map={halo} transparent blending={AdditiveBlending} depthWrite={false} color={[0.9, 1, 1.25]} fog={false} toneMapped={false} />
			</mesh>
			<mesh position={[-5.1, 2.05, -8.5]}>
				<planeGeometry args={[1.3, 1.3]} />
				<meshBasicMaterial map={moon} transparent color={[3, 3, 2.9]} fog={false} toneMapped={false} />
			</mesh>
			{/* Moonlight through the window: the wall and the bars cut it, so the window lies on the floor. */}
			<spotLight
				position={moonlight.from}
				target={moonTarget}
				color="#b8ccff"
				intensity={26}
				angle={0.3}
				penumbra={0.25}
				distance={10}
				decay={1.6}
				castShadow
				shadow-mapSize={[1024, 1024]}
				shadow-bias={-0.0004}
				shadow-normalBias={0.02}
			/>
			<primitive object={moonTarget} />
			<directionalLight position={[-3, 4, -6]} color="#bcd0ff" intensity={0.2} />
		</group>
	);
}

/** Where the moon hangs in the open: behind the cabinet, a little to the right, up over the lanterns (clear of the sakura). */
const moonrise = new Vector3(1.0, 2.7, -21);

/**
 * The night with no walls: stars all over the sky, and a big full moon
 * rising behind, mirrored in the floor. Its cool light throws everything's
 * shadow forwards.
 */
export function OpenSky() {
	const { moon } = useMoon();
	const stars = useMemo(() => {
		const n = 1400;
		const p = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			// Spread over the dome above the horizon, thinning towards it.
			const a = Math.random() * Math.PI * 2;
			const up = Math.asin(Math.random() ** 0.7);
			p.set([Math.cos(a) * Math.cos(up) * 30, Math.sin(up) * 30 + 0.5, Math.sin(a) * Math.cos(up) * 30], i * 3);
		}
		const g = new BufferGeometry();
		g.setAttribute("position", new BufferAttribute(p, 3));
		return g;
	}, []);

	return (
		<group>
			<points geometry={stars}>
				<pointsMaterial color="#dfe6ff" size={1.6} sizeAttenuation={false} transparent opacity={0.8} fog={false} depthWrite={false} />
			</points>
			{/* Bright enough that the bloom gives it a glow; always turned to face you, so it stays round from any side. */}
			<Billboard position={moonrise}>
				<mesh>
					<planeGeometry args={[2.2, 2.2]} />
					<meshBasicMaterial map={moon} transparent color={[1.9, 1.9, 1.85]} fog={false} toneMapped={false} />
				</mesh>
			</Billboard>
			{/* Moonlight: cool, from up behind, where the moon is, casting shadows. Higher than the moon looks, so it
			    doesn't graze the floor, and its shadows reach past where the dark swallows the floor. */}
			<directionalLight
				position={[1, 7, -7]}
				color="#b8ccff"
				intensity={0.9}
				castShadow
				shadow-mapSize={[2048, 2048]}
				shadow-camera-left={-10}
				shadow-camera-right={10}
				shadow-camera-top={10}
				shadow-camera-bottom={-10}
				shadow-camera-near={1}
				shadow-camera-far={30}
				shadow-bias={-0.0004}
				shadow-normalBias={0.02}
			/>
		</group>
	);
}

/** Click a corner to be taken to it, and once there, click to use it; hovering says where you'd go. */
function useVisit(to: "tv" | "records", use?: () => void) {
	const { view, go, hover } = useView();
	const away = view !== to;
	return {
		onClick: (event: ThreeEvent<MouseEvent>) => {
			if (!isTap(event) || (!away && !use)) return;
			event.stopPropagation();
			if (away) go(to);
			// Once you're there, a tap uses it.
			else use?.();
		},
		onPointerOver: (event: ThreeEvent<PointerEvent>) => {
			event.stopPropagation();
			if (!away && !use) return;
			document.body.style.cursor = "pointer";
			if (away) hover(to);
		},
		onPointerOut: () => {
			document.body.style.cursor = "";
			hover(null);
		},
	};
}

/** A model from public/models, keeping its own materials. */
function useModel(url: string) {
	const { scene } = useGLTF(url, false);
	return useMemo(() => {
		const copy = scene.clone(true);
		copy.traverse((o) => (o.castShadow = true));
		return copy;
	}, [scene]);
}

/**
 * The TV's own little game, drawn each frame: two paddles knocking a ball
 * back and forth, in lime and cyan pixels on black. A CRT's glow lights the
 * corner and flickers with it.
 */
function useTvGame() {
	const canvas = useMemo(() => Object.assign(document.createElement("canvas"), { width: 160, height: 120 }), []);
	const texture = useMemo(() => {
		const t = new CanvasTexture(canvas);
		t.colorSpace = SRGBColorSpace;
		return t;
	}, [canvas]);
	const state = useRef({ x: 80, y: 60, vx: 70, vy: 46, left: 60, right: 60, last: 0 });

	useFrame(({ clock }) => {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const s = state.current;
		const t = clock.elapsedTime;
		// Twenty frames a second is plenty for a 160 × 120 game.
		if (t - s.last < 0.05 && s.last !== 0) return;
		const dt = s.last === 0 ? 0 : Math.min(0.1, t - s.last);
		s.last = t;
		if (!still()) {
			s.x += s.vx * dt;
			s.y += s.vy * dt;
			if (s.y < 6 || s.y > 114) s.vy *= -1;
			if (s.x < 14 || s.x > 146) {
				s.vx *= -1;
				tvBlip(s.x > 80);
			}
			s.left += (s.y - s.left) * Math.min(1, dt * 5);
			s.right += (s.y - s.right) * Math.min(1, dt * 4);
		}
		ctx.fillStyle = "#020306";
		ctx.fillRect(0, 0, 160, 120);
		ctx.fillStyle = "#1f2a10";
		for (let y = 0; y < 120; y += 8) ctx.fillRect(79, y, 2, 4);
		ctx.fillStyle = lime;
		ctx.fillRect(8, s.left - 12, 4, 24);
		ctx.fillStyle = cyan;
		ctx.fillRect(148, s.right - 12, 4, 24);
		ctx.fillStyle = "#f3f3ee";
		ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
		ctx.fillStyle = "rgb(0 0 0 / 0.3)";
		for (let y = 0; y < 120; y += 2) ctx.fillRect(0, y, 160, 1);
		// Round the corners, like the tube's.
		ctx.globalCompositeOperation = "destination-in";
		ctx.fillStyle = "#000";
		ctx.beginPath();
		ctx.roundRect(0, 0, 160, 120, 14);
		ctx.fill();
		ctx.globalCompositeOperation = "source-over";
		texture.needsUpdate = true;
	});
	return texture;
}

/**
 * The TV's picture, shaped to its glass (measured from the model): 0.28 × 0.21 m, centred 0.194 m
 * up, bulging 1.4 cm forward in the middle. A Trinitron's tube curves side to side and is flat top
 * to bottom; the model's glass is a few flat facets, so this sits 5 mm proud of it and wins the
 * depth test. A touch smaller, so its edges tuck under the bezel.
 */
const glassGeometry = (() => {
	const [w, h, cy] = [0.274, 0.205, 0.194];
	const g = new PlaneGeometry(w, h, 16, 12);
	const p = g.attributes.position as BufferAttribute;
	for (let i = 0; i < p.count; i++) {
		const x = p.getX(i) / (w / 2);
		p.setXYZ(i, p.getX(i), p.getY(i) + cy, 0.209 + 0.0145 * (1 - x * x));
	}
	g.computeVertexNormals();
	return g;
})();

/** A low stand in the left corner with the CRT and the PlayStation on it. */
export function TvCorner() {
	const tv = useModel("/models/crt-tv.glb");
	const ps = useModel("/models/playstation.glb");
	const game = useTvGame();
	const glow = useRef<PointLight>(null);

	useFrame(({ clock }) => {
		if (glow.current && !still()) glow.current.intensity = 0.55 + Math.sin(clock.elapsedTime * 9) * 0.06 + Math.sin(clock.elapsedTime * 23) * 0.04;
	});

	return (
		<group position={anchors.tv.at} rotation={[0, anchors.tv.turn, 0]} scale={anchors.tv.scale} {...useVisit("tv")}>
			{/* The stand: a dark top and sides, open in front with a shelf. */}
			<mesh position={[0, stand.h - 0.015, 0]}>
				<boxGeometry args={[stand.w, 0.03, stand.d]} />
				<meshStandardMaterial color="#1c1714" roughness={0.6} />
			</mesh>
			{[-1, 1].map((side) => (
				<mesh key={side} position={[(side * (stand.w - 0.03)) / 2, stand.h / 2, 0]}>
					<boxGeometry args={[0.03, stand.h, stand.d]} />
					<meshStandardMaterial color="#1c1714" roughness={0.6} />
				</mesh>
			))}
			<mesh position={[0, 0.16, -0.02]}>
				<boxGeometry args={[stand.w - 0.06, 0.02, stand.d - 0.04]} />
				<meshStandardMaterial color="#17130f" roughness={0.7} />
			</mesh>
			<primitive object={tv} position={[-0.17, stand.h, 0]} />
			{/* The game on the TV's glass, just in front of it. */}
			<mesh position={[-0.17, stand.h, 0]} geometry={glassGeometry}>
				<meshBasicMaterial map={game} transparent color={[1.4, 1.4, 1.4]} toneMapped={false} polygonOffset polygonOffsetFactor={-4} polygonOffsetUnits={-4} />
			</mesh>
			<primitive object={ps} position={[0.27, stand.h, 0.02]} rotation={[0, -Math.PI / 2, 0]} />
			<pointLight ref={glow} position={[-0.17, stand.h + 0.2, 0.45]} color="#9fd8ff" intensity={0.55} distance={1.8} decay={2} />
		</group>
	);
}

/** A side table in the right corner with the record player, its record spinning at 33⅓. */
/** Hangs the turntable's moving parts from pivots, and works out how far the arm swings to reach the record. */
function buildRig(deck: Object3D) {
	deck.updateMatrixWorld(true);
	const find = (name: string) => deck.getObjectByName(`#RPL0002_${name}_#RPL0002_Textures_0`);
	const hang = (parts: (Object3D | undefined)[], at: Vector3) => {
		const hub = new Group();
		hub.position.copy(at);
		deck.add(hub);
		hub.updateMatrixWorld(true);
		for (const part of parts) {
			if (!part) continue;
			hub.attach(part);
			// Its bounds were worked out before it moved; don't let a stale box cull it.
			part.traverse((o) => (o.frustumCulled = false));
		}
		return hub;
	};
	const platter = find("Platter");
	const disc = platter ? new Box3().setFromObject(platter) : new Box3();
	const centre = disc.getCenter(new Vector3());
	const radius = disc.getSize(new Vector3()).x / 2;
	const post = find("Tone_Arm_Pivot");
	const arm = find("Tone_Arm");
	const pivotAt = post ? new Box3().setFromObject(post).getCenter(new Vector3()) : new Vector3();

	// The needle: the point of the arm furthest from its pivot.
	const tip = new Vector3();
	const v = new Vector3();
	arm?.traverse((o) => {
		const geometry = (o as Mesh).geometry;
		if (!geometry) return;
		const p = geometry.attributes.position;
		for (let i = 0; i < p.count; i++) {
			v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
			if (Math.hypot(v.x - pivotAt.x, v.z - pivotAt.z) > Math.hypot(tip.x - pivotAt.x, tip.z - pivotAt.z)) tip.copy(v);
		}
	});
	// How far the arm swings to set the needle down in the outer groove: the smallest turn either way.
	const groove = radius * 0.86;
	const reach = (turn: number) => {
		const [x, z] = [tip.x - pivotAt.x, tip.z - pivotAt.z];
		const [c, s] = [Math.cos(turn), Math.sin(turn)];
		return Math.hypot(pivotAt.x + x * c + z * s - centre.x, pivotAt.z - x * s + z * c - centre.z);
	};
	let swing = 0;
	for (let step = 0.005; step < 1.2; step += 0.005) {
		if (reach(step) <= groove) {
			swing = step;
			break;
		}
		if (reach(-step) <= groove) {
			swing = -step;
			break;
		}
	}
	return {
		platter: hang([platter], centre),
		arm: hang([arm, find("Weight")], pivotAt),
		armHeight: pivotAt.y,
		swing,
	};
}

export function RecordCorner() {
	const deck = useModel("/models/record-player.glb");
	// The model's parts all share one see-through material, so parts drawn first could hide the
	// platter under them: make them all solid.
	useMemo(() => {
		deck.traverse((o) => {
			const mesh = o as Mesh;
			if (!mesh.isMesh) return;
			const material = (mesh.material as MeshStandardMaterial).clone();
			// The clear dust cover stands open behind it, and only its handle shows, floating: leave it off.
			if (mesh.name.includes("Cover")) mesh.visible = false;
			// (The loader also turns depth writing off for see-through materials: turn it back on.)
			else Object.assign(material, { transparent: false, depthWrite: true, opacity: 1, alphaTest: 0.5 });
			mesh.material = material;
		});
	}, [deck]);

	// The moving parts, each hung from a pivot of its own: the platter from its centre, the tone arm
	// (and its counterweight) from the arm's pivot post. Measured before the deck joins the scene,
	// so its world is its own frame. Built once per deck and kept on it: setting up moves the parts,
	// so running it again (as React may, in development) must hand back the same rig.
	const rig = useMemo(() => (deck.userData.rig ??= buildRig(deck)) as ReturnType<typeof buildRig>, [deck]);

	// Playing: the platter spins up, the arm lifts, swings over the record and sets down, and the music
	// starts as the needle lands (if sound is on). Stopping runs it all backwards.
	const { record, toggleRecord } = useView();
	const playing = useRef(record);
	playing.current = record;
	// Playing when the scene opens: open mid-song, the needle already down and the platter at speed.
	const arm = useRef({ turn: record ? rig.swing : 0, lift: 0 });
	const speed = useRef(record ? 1 : 0);
	const music = useRef<(() => void) | null>(null);
	const sound = useRef(false);
	sound.current = useSoundOn();
	useEffect(() => () => music.current?.(), []);

	useFrame((_, dt) => {
		const goal = playing.current ? rig.swing : 0;
		const a = arm.current;
		if (still()) {
			a.turn = goal;
			a.lift = 0;
			speed.current = playing.current ? 1 : 0;
		} else {
			const there = Math.abs(a.turn - goal) < 0.002;
			// Up before it moves, down once it's there.
			a.lift += Math.max(-dt * 2.5, Math.min(dt * 2.5, (there ? 0 : 1) - a.lift));
			if (!there && a.lift > 0.98) a.turn += Math.max(-dt * 0.5, Math.min(dt * 0.5, goal - a.turn));
			// Up to speed in about a second; a slower run down.
			speed.current += ((playing.current ? 1 : 0) - speed.current) * Math.min(1, dt * (playing.current ? 2 : 0.9));
		}
		rig.arm.rotation.y = a.turn;
		rig.arm.position.y = rig.armHeight + a.lift * 0.012;
		rig.platter.rotation.y -= dt * speed.current * ((33.33 / 60) * Math.PI * 2);

		const landed = playing.current && Math.abs(a.turn - goal) < 0.002 && a.lift < 0.02;
		// Browsers won't play sound before the visitor's first click or key: wait for it, then join in.
		const heard = sound.current && (navigator.userActivation?.hasBeenActive ?? true);
		if (landed && heard && !music.current) music.current = startRecord();
		if ((!landed || !heard) && music.current) {
			music.current();
			music.current = null;
		}
	});

	return (
		<group position={anchors.records.at} rotation={[0, anchors.records.turn, 0]} scale={anchors.records.scale} {...useVisit("records", toggleRecord)}>
			<mesh position={[0, 0.27, 0]}>
				<cylinderGeometry args={[0.32, 0.3, 0.54, 32]} />
				<meshStandardMaterial color="#141418" roughness={0.5} metalness={0.2} />
			</mesh>
			<group position={[0, 0.54, 0]}>
				<primitive object={deck} />
			</group>
			{/* A warm reading-lamp light on the deck, so the record shows up close. */}
			<pointLight position={[0.1, 1.0, 0.35]} color="#ffcf87" intensity={0.9} distance={1.4} decay={2} />
		</group>
	);
}

useGLTF.preload("/models/crt-tv.glb", false);
useGLTF.preload("/models/playstation.glb", false);
useGLTF.preload("/models/record-player.glb", false);
