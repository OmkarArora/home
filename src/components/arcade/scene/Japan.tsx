"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
	Box3,
	BufferAttribute,
	BufferGeometry,
	AdditiveBlending,
	CanvasTexture,
	Color,
	DoubleSide,
	type Group,
	type InstancedMesh,
	LatheGeometry,
	type Mesh,
	MeshStandardMaterial,
	type PointLight,
	type Points,
	Object3D,
	QuadraticBezierCurve3,
	Shape,
	ShapeGeometry,
	SRGBColorSpace,
	Vector2,
	Vector3,
} from "three";

import { firework } from "./ambience";
import { type Granted, softDot, type Stage } from "./DragonBalls";
import { layout } from "./layout";
import { NeonSign } from "./Props";
import { usePalette } from "./palette";

/**
 * A Japanese arcade night round the cabinet: a tall katakana neon on a pole, the way the signs hang
 * down the side streets in Tokyo, a sakura in bloom over the dragon's pedestal, dropping petals, and
 * paper lanterns strung from the tree to the sign.
 */

const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** While the summon's storm is up (the sky dark), the lanterns swing hard. */
const stormy = (stage: Stage) => stage === "glow" || stage === "strike" || stage === "arrive" || stage === "stare" || stage === "grant";

/** What the sign says: ゲーセン ("ge-sen"), everyday Japanese for an arcade, short for ゲームセンター. */
const word = "ゲーセン";

/**
 * The katakana, drawn by hand on a 10-pixel grid (no font to load, and the same on every screen).
 * The long-vowel bar runs down, as it does in a sign read top to bottom.
 */
const em = 10;
const glyphs: Record<string, string[]> = {
	"ゲ": ["0001000101", "0010000101", "0011111111", "0100001000", "1000001000", "0000001000", "0000010000", "0000100000", "0001000000", "0110000000"],
	"ー": ["0000000000", "0000110000", "0000110000", "0000110000", "0000110000", "0000110000", "0000110000", "0000110000", "0000110000", "0000000000"],
	"セ": ["0010000000", "0010000000", "0010000000", "1111111111", "0010000001", "0010000010", "0010001100", "0010000000", "0010000000", "0001111111"],
	"ン": ["0000000000", "1100000000", "0110000001", "0010000010", "0000000010", "0000000100", "0000001000", "0000110000", "0011000000", "1100000000"],
};

/** The word as one sprite, a character under the next with two blank rows between. */
const sprite = [...word].flatMap((char, i) => [...(i ? ["0".repeat(em), "0".repeat(em)] : []), ...glyphs[char]]);

/** Where the sign stands: back right, past the records, framing the wide view. */
const post = { x: layout.sign[0], z: layout.sign[1] };
/** How wide the sign is (m), and how high its top is. */
const width = 0.25;
const top = 2.3;

export function KatakanaSign() {
	const { sign } = usePalette();
	const height = (sprite.length / em) * width;
	return (
		<group>
			{/* The pole, and a short arm out to the sign. */}
			<mesh position={[post.x + 0.3, top / 2, post.z]} castShadow>
				<cylinderGeometry args={[0.028, 0.034, top, 10]} />
				<meshStandardMaterial color="#1b1c22" roughness={0.6} metalness={0.5} />
			</mesh>
			<mesh position={[post.x + 0.17, top - 0.08, post.z]} rotation={[0, 0, Math.PI / 2]}>
				<cylinderGeometry args={[0.014, 0.014, 0.26, 8]} />
				<meshStandardMaterial color="#1b1c22" roughness={0.6} metalness={0.5} />
			</mesh>
			<NeonSign
				sprite={sprite}
				colour={sign[0]}
				width={width}
				position={[post.x, top - 0.12 - height / 2, post.z]}
				// Its own tired beat: a long cut, then a stutter.
				stutter={(t) => {
					const f = ((t + 1.1) % 7.3) / 7.3;
					return (f > 0.22 && f < 0.245) || (f > 0.71 && f < 0.718) || (f > 0.726 && f < 0.734);
				}}
			/>
		</group>
	);
}

/** The lanterns: 22 cm across and 28 cm tall, a round-ish oval. */
const lantern = { radius: 0.11, height: 0.28 } as const;

/** A lantern's paper: an oval, open top and bottom where the caps sit. */
const paper = (() => {
	const { radius, height } = lantern;
	const points: Vector2[] = [];
	for (let i = 0; i <= 20; i++) {
		const y = -height / 2 + (i / 20) * height;
		const k = (2 * y) / height;
		points.push(new Vector2(radius * Math.max(0.5, Math.sqrt(1 - k * k)), y));
	}
	return new LatheGeometry(points, 24);
})();

/**
 * The paper's bamboo ribs, dark rings round it so it reads as a chōchin, not a ball, and a character
 * brushed on in black on the side that faces you (the middle of the texture; the paper is turned
 * half round to put it there). Without a Japanese font it would come out as an empty box: then plain.
 */
function paperTexture(character: string) {
	const [w, h] = [256, 128];
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = "#6b6b6b";
		for (let y = 4; y < h; y += 10) ctx.fillRect(0, y, w, 2);
		ctx.font = brush;
		if (canDraw(character)) {
			// The paper is about 2.5 times round as it is tall, the canvas only twice: narrow it to match.
			ctx.save();
			ctx.translate(w / 2, h / 2 + 4);
			ctx.scale(((w / h) * lantern.height) / (2 * Math.PI * lantern.radius), 1);
			ctx.fillStyle = "#1a0f0b";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(character, 0, 0);
			ctx.restore();
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

const brush = `bold 84px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Noto Serif CJK JP", serif`;

/** Whether this browser has a font for the character: drawn, it differs from a character no font has (the empty box). */
function canDraw(character: string) {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 32;
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return false;
	ctx.font = brush.replace("84px", "28px");
	ctx.textBaseline = "top";
	const drawn = (c: string) => {
		ctx.clearRect(0, 0, 32, 32);
		ctx.fillText(c, 2, 2);
		return ctx.getImageData(0, 0, 32, 32).data.join();
	};
	return drawn(character) !== drawn("\u{10FFFD}");
}

/** What's painted on them, by colour: 祭 (festival) on the red, 遊 (play) on the cream. */
const characters = ["祭", "遊"] as const;

/** How much bigger the tree is than the 2.7 m it was placed for (the lanterns' wire is tied to it). */
const grown = layout.tree.height / 2.7;

/**
 * Where the lanterns hang, hanami style: one wire from a high branch of the sakura, across the back
 * behind the cabinet to the sign's pole, sagging in the middle (spaced to miss the hologram and the
 * sign).
 */
const wire = { from: new Vector3(layout.tree.foot[0] + 0.88 * grown, 2.3, layout.tree.foot[1] - 0.48 * grown), to: new Vector3(post.x + 0.3, top - 0.05, post.z), sag: 0.2, along: [0.1, 0.56, 0.7, 0.84] };

export function Lanterns({ stage }: { stage: Stage }) {
	const { lanterns } = usePalette();
	const textures = useMemo(() => characters.map(paperTexture), []);
	const curve = useMemo(() => {
		const middle = wire.from.clone().lerp(wire.to, 0.5);
		middle.y -= wire.sag * 2;
		return new QuadraticBezierCurve3(wire.from, middle, wire.to);
	}, []);
	const hung = useMemo(() => wire.along.map((f) => curve.getPoint(f)), [curve]);
	const swing = useRef<(Group | null)[]>([]);
	const storm = useRef(0);
	useFrame(({ clock }, dt) => {
		if (still()) return;
		const t = clock.elapsedTime;
		storm.current += ((stormy(stage) ? 1 : 0) - storm.current) * Math.min(1, dt * 0.8);
		const reach = 0.05 + storm.current * 0.32;
		const pace = 1 + storm.current * 1.8;
		swing.current.forEach((g, i) => {
			if (!g) return;
			g.rotation.z = Math.sin(t * 1.3 * pace + i * 1.7) * reach;
			g.rotation.x = Math.sin(t * 0.9 * pace + i * 2.3) * reach * 0.6;
		});
	});
	return (
		<group>
			<mesh>
				<tubeGeometry args={[curve, 32, 0.004, 5, false]} />
				<meshStandardMaterial color="#141418" roughness={0.8} />
			</mesh>
			{hung.map((at, i) => {
				const colour = lanterns[i % 2];
				const texture = textures[i % 2];
				const cord = 0.06;
				return (
					<group
						key={i}
						position={at}
						ref={(g) => {
							swing.current[i] = g;
						}}
					>
						{/* A cord, then the lantern under it with a dark cap top and bottom. */}
						<mesh position={[0, -cord / 2, 0]}>
							<cylinderGeometry args={[0.002, 0.002, cord, 4]} />
							<meshBasicMaterial color="#141418" />
						</mesh>
						<group position={[0, -cord - lantern.height * 0.54, 0]}>
							<mesh geometry={paper} rotation={[0, Math.PI, 0]}>
								<meshStandardMaterial color={colour} map={texture} emissive={colour} emissiveMap={texture} emissiveIntensity={1.7} roughness={0.9} />
							</mesh>
							{[1, -1].map((side) => (
								<mesh key={side} position={[0, side * lantern.height * 0.52, 0]}>
									<cylinderGeometry args={[lantern.radius * 0.52, lantern.radius * 0.52, lantern.height * 0.08, 16]} />
									<meshStandardMaterial color="#17120f" roughness={0.7} />
								</mesh>
							))}
						</group>
					</group>
				);
			})}
			{/* One warm light for the lot, so they light the floor and the back of the cabinet a little. */}
			<pointLight position={[0.6, 1.9, -1.3]} color={lanterns[0]} intensity={1.2} distance={3.2} decay={1.6} />
		</group>
	);
}

/** A repeatable random, so the blossom and petals come out the same every time. */
function seeded(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** The model's size and place: how tall (m), and where the foot of its trunk stands. */
const sakura = { height: layout.tree.height, foot: new Vector3(layout.tree.foot[0], 0, layout.tree.foot[1]) };

/** The blossom's colours, shared with its shader: the petals' four pinks and a white, and how much it glows. */
const petalPinks = { uDeep: { value: new Color() }, uPale: { value: new Color() }, uRose: { value: new Color() }, uBlush: { value: new Color() }, uWhite: { value: new Color() }, uGlow: { value: 0.45 } };

/**
 * Gives every separate cluster of flowers in the blossom mesh (each a little island of triangles) one
 * random number, `aTint`, for the shader to pick its colours by.
 */
function tintClusters(geometry: BufferGeometry) {
	if (geometry.getAttribute("aTint")) return;
	const count = geometry.attributes.position.count;
	const index = geometry.index;
	// Union-find over the vertices, joined by the triangles they share.
	const parent = Int32Array.from({ length: count }, (_, i) => i);
	const root = (i: number): number => {
		while (parent[i] !== i) i = parent[i] = parent[parent[i]];
		return i;
	};
	if (index) for (let i = 0; i < index.count; i += 3) {
		const a = root(index.getX(i));
		parent[root(index.getX(i + 1))] = a;
		parent[root(index.getX(i + 2))] = a;
	}
	const random = seeded(31);
	const picked = new Map<number, number>();
	const tint = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		const r = root(i);
		if (!picked.has(r)) picked.set(r, random());
		tint[i] = picked.get(r) ?? 0;
	}
	geometry.setAttribute("aTint", new BufferAttribute(tint, 1));
}

/**
 * Jogoss's sakura (CC BY 4.0, via `pnpm arcade:props`): a bark trunk and a crown of photographed
 * blossom clusters. The blossom is cut out (alpha-tested, so it sorts cleanly against everything else),
 * recoloured to the falling petals' pinks and lit a little from within, so it holds its pink at night.
 */
function SakuraModel() {
	const { scene } = useGLTF("/models/sakura.glb", false);
	const { blossom } = usePalette();
	const tree = useMemo(() => {
		const tree = scene.clone(true);
		const box = new Box3().setFromObject(tree);
		const size = sakura.height / (box.max.y - box.min.y);
		tree.traverse((o) => {
			const mesh = o as Mesh;
			if (!mesh.isMesh) return;
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			const from = mesh.material as MeshStandardMaterial;
			const flowers = from.transparent || from.alphaTest > 0;
			const material = new MeshStandardMaterial({ map: from.map, roughness: 0.9, side: DoubleSide, ...(flowers ? { alphaTest: 0.45 } : {}) });
			if (flowers) {
				// The photo's light and shade, in the tree's colours (its own salmon dropped): most clusters near
				// white with a blush of pink at the heart, as Somei-Yoshino is, some pale pink, a few deeper.
				// It glows a little in its own colour, so it's as bright as the falling petals at night.
				tintClusters(mesh.geometry);
				material.onBeforeCompile = (shader) => {
					Object.assign(shader.uniforms, petalPinks);
					shader.vertexShader = `attribute float aTint;\nvarying float vTint;\n${shader.vertexShader}`.replace(
						"#include <begin_vertex>",
						"#include <begin_vertex>\nvTint = aTint;",
					);
					shader.fragmentShader = `uniform vec3 uDeep;\nuniform vec3 uPale;\nuniform vec3 uRose;\nuniform vec3 uBlush;\nuniform vec3 uWhite;\nuniform float uGlow;\nvarying float vTint;\n${shader.fragmentShader}`
						.replace(
							"#include <map_fragment>",
							`#include <map_fragment>
							float shade = smoothstep(0.35, 1.0, dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114)));
							float t = vTint;
							// Heart to edge of each cluster, in one of four pairs of colours.
							vec3 low = t < 0.1 ? uRose : t < 0.3 ? uDeep : t < 0.55 ? uBlush : uPale;
							vec3 high = t < 0.1 ? uDeep : t < 0.3 ? uBlush : t < 0.55 ? uPale : uWhite;
							diffuseColor.rgb = mix(low, high, shade) * (0.78 + 0.35 * shade);`,
						)
						.replace("#include <emissivemap_fragment>", "totalEmissiveRadiance = diffuseColor.rgb * uGlow;");
				};
			}
			mesh.material = material;
			mesh.userData.flowers = flowers;
		});
		tree.scale.setScalar(size);
		return tree;
	}, [scene]);
	useLayoutEffect(() => {
		petalPinks.uDeep.value.set(blossom[0]);
		petalPinks.uPale.value.set(blossom[1]);
		petalPinks.uRose.value.set(blossom[2]);
		petalPinks.uBlush.value.set(blossom[3]);
		petalPinks.uWhite.value.set(blossom[1]).lerp(new Color("#ffffff"), 0.75);
	}, [blossom]);
	return <primitive object={tree} />;
}

useGLTF.preload("/models/sakura.glb", false);

/** Is this a small screen, where fewer petals fall? */
const small = () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;

/**
 * The sakura over the dragon's pedestal, swaying from its foot (a breath at night, hard in the
 * storm), with its own pink light on the pedestal and the floor, and its petals falling.
 */
export function Sakura({ stage, granted }: { stage: Stage; granted: Granted | null }) {
	const { blossom } = usePalette();
	const tree = useRef<Group>(null);
	const storm = useRef(0);
	// The wish for spring: a minute's flurry of extra petals blowing across the street, then they settle.
	const [flurry, setFlurry] = useState<number | null>(null);
	useEffect(() => {
		if (granted?.kind !== "spring") return;
		setFlurry(granted.n);
		const done = window.setTimeout(() => setFlurry(null), (spring.seconds + 25) * 1000);
		return () => window.clearTimeout(done);
	}, [granted]);
	useFrame(({ clock }, dt) => {
		if (still()) return;
		storm.current += ((stormy(stage) ? 1 : 0) - storm.current) * Math.min(1, dt * 0.8);
		const t = clock.elapsedTime;
		if (tree.current) {
			tree.current.rotation.z = Math.sin(t * 0.7) * 0.004 + Math.sin(t * 2.6) * storm.current * 0.022 - storm.current * 0.02;
			tree.current.rotation.x = Math.sin(t * 0.5 + 1) * 0.003 + Math.sin(t * 2.1) * storm.current * 0.015;
		}
	});
	return (
		<group>
			<group position={sakura.foot} ref={tree}>
				<SakuraModel />
			</group>
			<pointLight position={[layout.pedestal[0] - 0.05, 0.75, layout.pedestal[1] + 0.18]} color={blossom[0]} intensity={1.1} distance={2.4} decay={1.8} />
			<pointLight position={[sakura.foot.x + 1.1 * grown, 3.4 * grown, sakura.foot.z + 1.9]} color="#ffe6f0" intensity={4} distance={4.5} decay={1.6} />
			<Petals count={small() ? 110 : 240} stage={stage} storm={storm} />
			{flurry !== null && <Petals key={flurry} count={small() ? 160 : 360} stage={stage} storm={storm} gust={spring.gust} lasts={spring.seconds} />}
		</group>
	);
}

/** The spring flurry: how long it keeps coming (s), and the breeze carrying it across (m/s, to the right). */
const spring = { seconds: 60, gust: 0.55 } as const;

/** One petal: a little rounded blade with a notch at its tip, 3.5 cm long. */
const petal = (() => {
	const s = new Shape();
	s.moveTo(0, 0);
	s.bezierCurveTo(0.014, 0.008, 0.016, 0.026, 0.008, 0.035);
	s.lineTo(0, 0.03);
	s.lineTo(-0.008, 0.035);
	s.bezierCurveTo(-0.016, 0.026, -0.014, 0.008, 0, 0);
	return new ShapeGeometry(s, 4).translate(0, -0.017, 0);
})();

/** Where the petals start from: inside the crown, roughly. */
const crown = {
	x: [sakura.foot.x - 0.6 * grown, sakura.foot.x + 1.15 * grown],
	y: [1.5 * grown, 2.3 * grown],
	z: [sakura.foot.z - 0.4 * grown, sakura.foot.z + 1.4 * grown],
};

/**
 * The falling petals: each drifts down from the crown with a flutter, lands, lies on the floor a
 * while, shrinks away and starts again from the top. The storm lifts them all up and away; they come
 * back once it's cleared. With reduced motion they're only lying on the floor, still.
 */
/**
 * The petals. `gust` is a steady breeze to the right (m/s); with `lasts` (s) they're a passing flurry:
 * they come in from above the crown, keep coming that long, then each lands and is gone.
 */
function Petals({ count, stage, storm, gust = 0, lasts }: { count: number; stage: Stage; storm: React.RefObject<number>; gust?: number; lasts?: number }) {
	const { blossom } = usePalette();
	const mesh = useRef<InstancedMesh>(null);
	const random = useMemo(() => seeded(23), []);
	const state = useMemo(() => {
		const at = new Float32Array(count * 3);
		const spin = new Float32Array(count * 3);
		const phase = new Float32Array(count);
		// How long it's been on the floor (s); below zero, still falling.
		const down = new Float32Array(count);
		// Done with, for a flurry that's over.
		const gone = new Uint8Array(count);
		for (let i = 0; i < count; i++) {
			phase[i] = random() * 100;
			spin.set([random() * 3, random() * 3, random() * 3], i * 3);
			// Start mid-fall, everywhere between the crown and the floor, so it doesn't begin as one sheet;
			// a flurry comes in from above it instead, staggered, so it builds.
			if (lasts) at.set([lerp(crown.x, random()) - 1, crown.y[1] + random() * 3, lerp(crown.z, random())], i * 3);
			else at.set([lerp(crown.x, random()), random() * crown.y[1], lerp(crown.z, random())], i * 3);
			down[i] = -1;
		}
		return { at, spin, phase, down, gone };
	}, [count, random, lasts]);
	const o = useMemo(() => new Object3D(), []);
	// When it came (wall clock: three's own restarts after a hidden tab).
	const bornWall = useRef(performance.now() / 1000);
	useLayoutEffect(() => {
		const m = mesh.current;
		if (!m) return;
		const c = new Color();
		// Each petal one of the crown's pinks, or somewhere between two of them.
		const white = new Color(blossom[1]).lerp(new Color("#ffffff"), 0.75);
		for (let i = 0; i < count; i++) {
			// As the crown: about half near white, the rest pinks, a few deep.
			const r = random();
			c.set(r < 0.08 ? blossom[2] : r < 0.25 ? blossom[0] : r < 0.5 ? blossom[3] : blossom[1]);
			if (r > 0.6) c.lerp(white, (r - 0.6) * 2.5);
			m.setColorAt(i, c.multiplyScalar(1.1));
		}
		if (m.instanceColor) m.instanceColor.needsUpdate = true;
		if (still()) {
			// Still: a scatter of them lying on the floor under the tree.
			for (let i = 0; i < count; i++) {
				o.position.set(lerp([sakura.foot.x - 0.7, sakura.foot.x + 1.4], random()), 0.003, lerp([sakura.foot.z - 0.3, sakura.foot.z + 1.9], random()));
				o.rotation.set(-Math.PI / 2, 0, random() * 6);
				o.scale.setScalar(1);
				o.updateMatrix();
				m.setMatrixAt(i, o.matrix);
			}
			m.instanceMatrix.needsUpdate = true;
		}
	}, [blossom, count, o, random]);
	useFrame(({ clock, camera }, dt) => {
		const m = mesh.current;
		if (!m || still()) return;
		const t = clock.elapsedTime;
		const eye = camera.position;
		// After a stall (a hidden tab), don't jump.
		const step = Math.min(dt, 1 / 20);
		const wind = storm.current;
		const { at, spin, phase, down, gone } = state;
		for (let i = 0; i < count; i++) {
			const k = i * 3;
			let shrink = 1;
			if (gone[i]) {
				o.scale.setScalar(0);
				o.updateMatrix();
				m.setMatrixAt(i, o.matrix);
				continue;
			}
			if (down[i] < 0) {
				const f = phase[i];
				// Falling slowly with a flutter, carried on the breeze; the storm lifts and blows them off.
				at[k] += (0.06 + gust * (0.7 + (f % 0.6)) + Math.sin(t * 1.1 + f) * 0.14 + wind * 2.4) * step;
				at[k + 1] += (-0.13 + Math.sin(t * 1.5 + f * 1.3) * 0.05 + wind * (2.2 + (f % 1))) * step;
				at[k + 2] += (0.03 + Math.cos(t * 0.9 + f) * 0.1 + wind * 0.6) * step;
				o.rotation.set(t * spin[k] + f, t * spin[k + 1], t * spin[k + 2]);
				if (at[k + 1] <= 0.003) {
					at[k + 1] = 0.003;
					down[i] = 0;
				}
				// Gone off into the storm: wait out of sight until the sky clears, then start again.
				if (at[k + 1] > 7 || Math.abs(at[k]) > 8) {
					shrink = 0;
					if (!stormy(stage) && wind < 0.1) respawn(i);
				}
			} else {
				down[i] += step;
				o.rotation.set(-Math.PI / 2, 0, phase[i]);
				// The storm picks them up off the floor too.
				if (wind > 0.3) down[i] = -1;
				const lies = 4 + (phase[i] % 5);
				shrink = 1 - Math.min(1, Math.max(0, down[i] - lies));
				if (down[i] > lies + 1) respawn(i);
			}
			o.position.set(at[k], at[k + 1], at[k + 2]);
			// Close to the camera (the TV's view is under the crown) a petal would fill the screen: let it vanish.
			const near = o.position.distanceTo(eye);
			if (near < 1) shrink *= Math.max(0, (near - 0.6) / 0.4);
			o.scale.setScalar(shrink);
			o.updateMatrix();
			m.setMatrixAt(i, o.matrix);
		}
		m.instanceMatrix.needsUpdate = true;
	});
	function respawn(i: number) {
		// A flurry that's had its time: this one's done.
		if (lasts && performance.now() / 1000 - bornWall.current > lasts) {
			state.gone[i] = 1;
			return;
		}
		state.at.set([lerp(crown.x, random()), lerp(crown.y, random()), lerp(crown.z, random())], i * 3);
		state.down[i] = -1;
	}
	return (
		<instancedMesh ref={mesh} args={[petal, undefined, count]} frustumCulled={false}>
			<meshBasicMaterial side={DoubleSide} toneMapped={false} />
		</instancedMesh>
	);
}

const lerp = ([a, b]: readonly number[], f: number) => a + (b - a) * f;

/** How long the fireworks go on (s), and where they go up: far off behind the cabinet, low enough to show over it. */
// Up over the cabinet, where the sky view looks (`views.sky`).
const show = { seconds: 22, x: [-6, 10], z: [-30, -24], burst: [7, 11.5] } as const;

type Shell = { at: Vector3; v: Vector3; fuse: number; colour: Color };

/**
 * The wish for fireworks: hanabi over the street for twenty-odd seconds, shells climbing on a faint
 * trail and bursting into stars in the night's own colours (the lanterns, the blossom), quicker for
 * a finale. Each burst thumps and crackles and washes the scene in its colour for a moment.
 */
export function Fireworks({ granted }: { granted: Granted | null }) {
	const { lanterns, blossom, pools } = usePalette();
	const n = small() ? 1400 : 2800;
	const dot = useMemo(softDot, []);
	const points = useRef<Points>(null);
	const flash = useRef<PointLight>(null);
	const sky = useMemo(() => {
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
		geometry.setAttribute("color", new BufferAttribute(new Float32Array(n * 3), 3));
		return { geometry, v: new Float32Array(n * 3), life: new Float32Array(n), span: new Float32Array(n), hue: new Float32Array(n * 3), next: 0 };
	}, [n]);
	const run = useRef<{ n: number; from: number | null; launch: number; shells: Shell[] }>({ n: 0, from: null, launch: 0, shells: [] });
	const colours = useMemo(() => [lanterns[0], lanterns[1], blossom[0], blossom[3], pools[1], "#ffd27a"].map((c) => new Color(c)), [lanterns, blossom, pools]);

	/** One star: where, how fast, how long it burns, its colour (bright: it blooms). */
	const star = (at: Vector3, v: Vector3, life: number, colour: Color, bright: number) => {
		const i = sky.next;
		sky.next = (sky.next + 1) % n;
		(sky.geometry.attributes.position as BufferAttribute).setXYZ(i, at.x, at.y, at.z);
		sky.v.set([v.x, v.y, v.z], i * 3);
		sky.life[i] = sky.span[i] = life;
		sky.hue.set([colour.r * bright, colour.g * bright, colour.b * bright], i * 3);
	};

	useFrame(({ clock }, dt) => {
		const r = run.current;
		const t = clock.elapsedTime;
		const step = Math.min(dt, 1 / 20);
		if (granted?.kind === "fireworks" && granted.n !== r.n) {
			r.n = granted.n;
			r.from = t;
			r.launch = t;
		}
		const going = r.from !== null && t - r.from < show.seconds;
		// A shell up every so often, quicker in the last few seconds.
		if (going && t >= r.launch) {
			const left = show.seconds - (t - (r.from as number));
			r.launch = t + (left < 4 ? 0.12 + Math.random() * 0.25 : 0.45 + Math.random() * 0.9);
			const at = new Vector3(lerp(show.x, Math.random()), 0, lerp(show.z, Math.random()));
			const high = lerp(show.burst, Math.random());
			r.shells.push({ at, v: new Vector3((Math.random() - 0.5) * 0.6, high / 1.6, 0), fuse: 1.6, colour: colours[Math.floor(Math.random() * colours.length)] });
		}
		const v = new Vector3();
		r.shells = r.shells.filter((shell) => {
			shell.fuse -= step;
			shell.at.addScaledVector(shell.v, step);
			// A faint trail of sparks behind it as it climbs.
			star(shell.at, v.set((Math.random() - 0.5) * 0.3, -0.4, (Math.random() - 0.5) * 0.3), 0.35, shell.colour, 0.9);
			if (shell.fuse > 0) return true;
			// Burst: a ball of stars, the first instant white-hot.
			const count = small() ? 60 : 110;
			const speed = 5.2 + Math.random() * 1.6;
			for (let k = 0; k < count; k++) {
				v.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize().multiplyScalar(speed * (0.85 + Math.random() * 0.15));
				star(shell.at, v, 1.5 + Math.random() * 0.7, shell.colour, 2.6);
			}
			if (flash.current) {
				flash.current.color.copy(shell.colour);
				flash.current.intensity = 6;
			}
			firework(0.5 + Math.random() * 0.4);
			return false;
		});
		// The stars: slowed by the air, falling, fading as they burn out.
		const position = sky.geometry.attributes.position as BufferAttribute;
		const colour = sky.geometry.attributes.color as BufferAttribute;
		const drag = Math.exp(-1.7 * step);
		for (let i = 0; i < n; i++) {
			if (sky.life[i] <= 0) {
				colour.setXYZ(i, 0, 0, 0);
				continue;
			}
			sky.life[i] -= step;
			const k = i * 3;
			sky.v[k] *= drag;
			sky.v[k + 1] = sky.v[k + 1] * drag - 1.4 * step;
			sky.v[k + 2] *= drag;
			position.setXYZ(i, position.getX(i) + sky.v[k] * step, position.getY(i) + sky.v[k + 1] * step, position.getZ(i) + sky.v[k + 2] * step);
			const left = Math.max(0, sky.life[i] / sky.span[i]);
			// Bright as it bursts, then dimming, with a last flicker before it's gone.
			const glow = left * left * (left < 0.3 ? 0.6 + Math.random() * 0.4 : 1);
			colour.setXYZ(i, sky.hue[k] * glow, sky.hue[k + 1] * glow, sky.hue[k + 2] * glow);
		}
		position.needsUpdate = true;
		colour.needsUpdate = true;
		if (flash.current) flash.current.intensity *= Math.exp(-4 * step);
		if (points.current) points.current.visible = going || r.shells.length > 0 || sky.life.some((l) => l > 0);
	});

	return (
		<group>
			<points ref={points} geometry={sky.geometry} frustumCulled={false} visible={false}>
				<pointsMaterial map={dot} size={0.55} vertexColors transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
			</points>
			{/* Each burst lights the street a moment, from up behind the cabinet. */}
			<pointLight ref={flash} position={[0.5, 5, -5]} intensity={0} distance={18} decay={1.4} />
		</group>
	);
}