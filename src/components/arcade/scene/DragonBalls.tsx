"use client";

import type { OrbitControls } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	AdditiveBlending,
	BackSide,
	type Bone,
	Box3,
	type BufferAttribute,
	BufferGeometry,
	type Camera,
	CanvasTexture,
	CatmullRomCurve3,
	Color,
	ConeGeometry,
	type DirectionalLight,
	DoubleSide,
	Float32BufferAttribute,
	type Fog,
	FrontSide,
	LatheGeometry,
	Group,
	Matrix4,
	type Mesh,
	MeshBasicMaterial,
	MeshToonMaterial,
	DataTexture,
	RedFormat,
	NearestFilter,
	SkinnedMesh as SkinnedMeshObject,
	Mesh as MeshObject,
	MeshStandardMaterial,
	type Object3D,
	type PerspectiveCamera,
	type PointLight,
	type Points,
	ShaderMaterial,
	type SkinnedMesh,
	type Sprite,
	type SpriteMaterial,
	Vector2,
	Vector3,
	Vector4,
} from "three";

import { play } from "@/components/site/sound";

import { bigRoar, bigThunder, heartbeat, hushAmbience, preloadSummon, rumble, stormWind, whoosh } from "./ambience";
import { useView } from "./CameraRig";
import { layout } from "./layout";
import { anchors, isTap, stand } from "./views";
import { still } from "./tier";

/**
 * An easter egg, after Dragon Ball: six of the seven balls hidden round the scene,
 * the four-star one already on a pedestal by the cabinet. Click a ball and it
 * arcs over to its cup. With all seven there, the summon (as in the show):
 * everything goes quiet, the balls pulse like a heartbeat as storm cloud rolls
 * over the moon, yellow lightning strikes down into them, and a beam of light
 * shoots up out of them and snakes across the storm, 50 m of it, and turns
 * into the eternal dragon from the head back, coiled across the sky, to look you
 * in the face and ask for a wish. Granted, he turns back into light and bursts
 * into gold sparks; the balls rise, fly up into the storm together, and burst
 * apart into nothing (they turn up again later, stone, in new hiding places).
 */

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;
type V3 = [number, number, number];

const r = 0.055;

/** A ball resting on a point in a corner's frame (grown by its scale, as in `views.ts`); the ball stays its size. */
function place({ at, turn, scale = 1 }: { at: V3; turn: number; scale?: number }, [x, y, z]: V3): V3 {
	const [c, s] = [Math.cos(turn), Math.sin(turn)];
	[x, y, z] = [x * scale, y * scale, z * scale];
	return [at[0] + x * c + z * s, at[1] + y + r, at[2] - x * s + z * c];
}

/** The pedestal, front left of the cabinet under the sakura, and its seven cups: one in the middle, six round it. */
const pedestal = { at: [layout.pedestal[0], 0, layout.pedestal[1]] as V3, height: 0.62 };
const cups: V3[] = [
	[0, 0, 0],
	...Array.from({ length: 6 }, (_, i): V3 => [Math.cos((i / 6) * Math.PI * 2) * 0.118, 0, Math.sin((i / 6) * Math.PI * 2) * 0.118]),
].map(([x, , z]): V3 => [pedestal.at[0] + x, pedestal.height + r, pedestal.at[2] + z]);

/** Where the other six hide (tucked away, each half seen): by stars 1, 2, 3, 5, 6, 7. The four-star ball starts on the pedestal. */
const hidden: { stars: number; at: V3 }[] = [
	{ stars: 1, at: place(anchors.tv, [0.3, 0.17, 0.02]) }, // on the TV stand's lower shelf
	{ stars: 2, at: [layout.sign[0] + 0.38, r, layout.sign[1] - 0.06] }, // at the foot of the sign's pole
	{ stars: 3, at: place(anchors.records, [0.12, 0, -0.42]) }, // on the floor behind the turntable's table
	{ stars: 5, at: [0.12, r, -0.72] }, // on the floor behind the cabinet
	{ stars: 6, at: place(layout.sandwich, [0.02, 0, 0]) }, // under the sandwich board, between its legs
	{ stars: 7, at: [layout.tree.foot[0] - 0.22, r, layout.tree.foot[1] - 0.4] }, // behind the sakura's trunk, clear of its roots (out in the open)
];
/** Indoors there's no tree: the seven-star ball waits on the floor where it would stand. */
const indoors: V3 = [layout.tree.foot[0] + 0.1, r, layout.tree.foot[1] + 0.65];

/** The balls' names in the model, by their number of stars. */
const ballNames: Record<number, string> = { 1: "One Star", 2: "Two Star", 3: "Star Three", 4: "Four Star", 5: "Five Star", 6: "Six Star", 7: "Seven Star" };

/**
 * The seven balls from Anthony Yanez's model (CC BY 4.0, via `pnpm arcade:props`): each a
 * see-through orange shell with the stars inside it. Each gets its own copy, centred and sized,
 * with materials of its own so its glow can rise on its own.
 */
function useBallModels() {
	const { scene } = useGLTF("/models/dragon-balls.glb", false);
	return useMemo(() => {
		scene.updateMatrixWorld(true);
		const out: Record<number, { group: Group; shell: MeshStandardMaterial; shellColour: Color; stars: MeshStandardMaterial; back: MeshStandardMaterial }> = {};
		for (const [count, name] of Object.entries(ballNames)) {
			// The loader swaps the names' spaces for underscores.
			const prefix = `${name.replace(/ /g, "_")}_0`;
			const parts: Mesh[] = [];
			scene.traverse((o) => (o as Mesh).isMesh && o.name.startsWith(prefix) && parts.push(o as Mesh));
			const shellMesh = parts.find((m) => m.name.includes("_02"));
			const starMesh = parts.find((m) => m.name.includes("_03"));
			if (!shellMesh || !starMesh) continue;
			const bake = (m: Mesh) => m.geometry.clone().applyMatrix4(m.matrixWorld);
			const [shellGeo, starGeo] = [bake(shellMesh), bake(starMesh)];
			shellGeo.computeBoundingBox();
			const box = shellGeo.boundingBox as Box3;
			const centre = box.getCenter(new Vector3());
			const k = (2 * r) / box.getSize(new Vector3()).y;
			for (const g of [shellGeo, starGeo]) g.translate(-centre.x, -centre.y, -centre.z).scale(k, k, k);
			const shell = (shellMesh.material as MeshStandardMaterial).clone();
			// Thin enough glass to see the stars through; just its front, so it isn't doubled up.
			Object.assign(shell, { transparent: true, opacity: 0.42, depthWrite: false, roughness: 0.08, side: FrontSide });
			shell.emissive.set("#ff6a00");
			const stars = (starMesh.material as MeshStandardMaterial).clone();
			stars.emissive.set("#ff2020");
			stars.toneMapped = false;
			// The far side of the ball, from inside: solid glowing orange, so you see the stars against
			// it and never the room behind.
			const back = new MeshStandardMaterial({ color: "#ff8a1a", emissive: "#ff6a00", emissiveIntensity: 0.5, roughness: 0.4, side: BackSide });
			const group = new Group();
			const backObj = new MeshObject(shellGeo, back);
			const starObj = new MeshObject(starGeo, stars);
			const shellObj = new MeshObject(shellGeo, shell);
			// The back wall, then the stars, then the glass over them.
			starObj.renderOrder = 1;
			shellObj.renderOrder = 2;
			shellObj.castShadow = true;
			group.add(backObj, starObj, shellObj);
			out[Number(count)] = { group, shell, shellColour: shell.color.clone(), stars, back };
		}
		return out;
	}, [scene]);
}

/** Above everything in the scene (the cabinet's roof is at 1.8 m), so a flying ball never passes through anything. */
const clear = 2.25;

/** A curve from a to b that climbs straight up out of a, sweeps over at `height`, and drops straight down into b. */
const arc = (a: V3, b: V3, t: number, out: Vector3, height = clear) => {
	const u = 1 - t;
	const [w0, w1, w2, w3] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
	return out.set(
		a[0] * (w0 + w1) + b[0] * (w2 + w3),
		a[1] * w0 + height * (w1 + w2) + b[1] * w3,
		a[2] * (w0 + w1) + b[2] * (w2 + w3),
	);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

type BallState = {
	stars: number;
	home: V3;
	cup: V3;
	phase: "hidden" | "flying" | "placed";
	t: number;
	/** How stony the ball is (1 just after a wish), and how far it's come back after bursting away (0 to 1; below 0 is a wait). */
	stone: number;
	back: number;
	/** Where it was last frame, for its streak. */
	last: Vector3;
};

/**
 * The eternal dragon's way out of the balls: straight up the column of light he starts as, then
 * over the top and out in great loops behind the arcade, and down to stop face to face with you.
 * He stops with his head at the end, so the last 50 m he flew are the coils he's draped across
 * the sky in while he waits for the wish.
 */
const path = new CatmullRomCurve3(
	[
		[pedestal.at[0], pedestal.height, pedestal.at[2]],
		[pedestal.at[0], 6, pedestal.at[2]],
		[pedestal.at[0], 12, pedestal.at[2]],
		[-0.4, 17, 0.3],
		[-3, 20, -1.5],
		[-2, 19, 3],
		[3, 18, 1],
		[6, 17, -6],
		[0, 15, -12],
		[-9, 13, -9],
		[-11, 9, -2],
		[-6, 6.5, -5],
		[2, 9, -9],
		[5, 7, -4],
		[0.1, 5.2, -2.8],
		[0.3, 3.4, 0.3],
	].map(([x, y, z]) => new Vector3(x, y, z)),
	false,
	"catmullrom",
	0.5,
);
const pathLength = path.getLength();
/** Where you stand for the wish: low, in front of the cabinet, looking up into his face. */
const stareAt = new Vector3(0.6, 1.0, 4.6);
const head = path.getPointAt(1);
/** How far his way out of the balls runs straight up (m): while he's on it, he's a column of light. */
const straightUp = 14;

/**
 * Shenlong, from placebo_vscure's model (CC BY 4.0, via `pnpm arcade:props`). His skeleton's rest
 * pose is one long straight spine; each frame his spine is laid along the flight path behind his
 * head, with a wave travelling down it, so his whole body flows after his head like a ribbon. Every
 * bone off the spine (jaw, whiskers, mane) rides rigidly with the spine bone it hangs from.
 */
type Rig = {
	holder: Group;
	bones: Bone[];
	/** Each bone's rest pose, in the model's space. */
	rest: Matrix4[];
	/** The spine, head first: bone index, and how far down the body it sits (rest units). */
	spine: { bone: number; s: number }[];
	/** For each bone, the spine joint it moves with. */
	follows: number[];
	/** The rest pose's facing (towards the head) and up. */
	basis: Matrix4;
	/** How long the spine is, in rest units. */
	length: number;
	/** The spine joint his head sits on, and his jaw's bones and the turn that closes it (found on first use). */
	neck?: number;
	jaw?: { bones: Set<number>; hinge: Matrix4 };
};

function buildRig(scene: Object3D): Rig {
	scene.updateMatrixWorld(true);
	const holder = new Group();
	holder.add(scene);
	let body: SkinnedMesh | undefined;
	scene.traverse((o) => {
		o.frustumCulled = false;
		const m = o as SkinnedMesh;
		if (!m.isSkinnedMesh) return;
		m.castShadow = true;
		if (!body || m.geometry.attributes.position.count > body.geometry.attributes.position.count) body = m;
	});
	if (!body) throw new Error("Shenlong: no skinned body");
	const { bones, boneInverses } = body.skeleton;
	const rest = boneInverses.map((m) => m.clone().invert());
	const at = rest.map((m) => new Vector3().setFromMatrixPosition(m));
	const index = new Map(bones.map((b, i) => [b as Object3D, i]));
	const kids = bones.map((b) => b.children.flatMap((c) => (index.has(c) ? [index.get(c) as number] : [])));

	// The spine: the longest chain of bones from a root to a leaf.
	const longest = (i: number): { path: number[]; d: number } => {
		let best = { path: [i], d: 0 };
		for (const k of kids[i]) {
			const sub = longest(k);
			const d = sub.d + at[i].distanceTo(at[k]);
			if (d > best.d) best = { path: [i, ...sub.path], d };
		}
		return best;
	};
	const roots = bones.flatMap((b, i) => (b.parent && index.has(b.parent) ? [] : [i]));
	let chain = roots.map(longest).reduce((p, q) => (q.d > p.d ? q : p)).path;
	// A bone that isn't really on his body (a root sitting off at one end, then a long jump to the
	// next joint) is left off the spine.
	const step = (i: number) => at[chain[i]].distanceTo(at[chain[i + 1]]);
	const steps = chain.slice(0, -1).map((_, i) => step(i)).sort((p, q) => p - q);
	const usual = steps[steps.length >> 1];
	while (chain.length > 2 && step(0) > usual * 6) chain = chain.slice(1);
	while (chain.length > 2 && step(chain.length - 2) > usual * 6) chain = chain.slice(0, -1);
	// Head first: the head is the bulky end (antlers, whiskers, mane), the tail a thin tip.
	const near = (point: Vector3) => {
		let n = 0;
		const v = new Vector3();
		scene.traverse((o) => {
			const m = o as SkinnedMesh;
			if (!m.isSkinnedMesh) return;
			const p = m.geometry.attributes.position;
			for (let i = 0; i < p.count; i += 3) if (v.fromBufferAttribute(p, i).applyMatrix4(m.bindMatrix).distanceTo(point) < usual * 8) n++;
		});
		return n;
	};
	if (near(at[chain[chain.length - 1]]) > near(at[chain[0]])) chain = chain.reverse();
	let s = 0;
	const spine = chain.map((bone, i) => {
		if (i > 0) s += at[chain[i - 1]].distanceTo(at[bone]);
		return { bone, s };
	});
	const onSpine = new Map(chain.map((bone, i) => [bone, i]));
	const follows = bones.map((b, i) => {
		let o: Object3D | null = b;
		while (o && !onSpine.has(index.get(o) ?? -1)) o = o.parent && index.has(o.parent) ? o.parent : null;
		if (o) return onSpine.get(index.get(o) as number) as number;
		// Not hung from the spine: go with the nearest joint.
		let near = 0;
		for (let j = 1; j < chain.length; j++) if (at[chain[j]].distanceTo(at[i]) < at[chain[near]].distanceTo(at[i])) near = j;
		return near;
	});
	const forward = at[chain[0]].clone().sub(at[chain[Math.min(6, chain.length - 1)]]).normalize();
	const basis = frameOf(forward);
	for (const b of bones) {
		b.matrixAutoUpdate = false;
		b.matrixWorldAutoUpdate = false;
	}
	return { holder, bones, rest, spine, follows, basis, length: s };
}

/** A frame whose z is `forward` and whose y is as near world-up as it can be. */
const frameOf = (forward: Vector3) => {
	const up = Math.abs(forward.y) > 0.98 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
	const x = new Vector3().crossVectors(up, forward).normalize();
	const y = new Vector3().crossVectors(forward, x).normalize();
	return new Matrix4().makeBasis(x, y, forward);
};

/** His look for the storm, set up once on the model's own materials. */
type Look = {
	eyes: MeshStandardMaterial;
	/** A light round his edges, so he reads as a shape against the dark. */
	rim: { value: number };
	/**
	 * How much of him is still the light he came as (0 to 1), and where it gives way to him: the
	 * body from `edge` back (0 at his nose, 1 at his tail tip) is light, the rest is dragon.
	 */
	light: { value: number };
	edge: { value: number };
	time: { value: number };
	/** How far he's gone to dust, from the tail (0, all there, to 1, gone). */
	dust: { value: number };
	/**
	 * The column of light he comes up as (its axis x and z, foot y, height), and how far he's in it:
	 * 2 while his head is (nothing of him shows outside it, or his whiskers and mane would poke out),
	 * 1 while the column's still bright behind him (nothing beside it), 0 once he's clear.
	 */
	column: { value: Vector4 };
	inColumn: { value: number };
};

/** His length in the sky, in metres: big enough that you only ever see part of him at once. */
const dragonLength = 50;

/**
 * Every part of him (skin, teeth, eyes) gets the same two extras: the rim light, and the light he
 * arrives and leaves as, cream and yellow in drifting blotches, like the show's.
 */
function lookOf(scene: Object3D, rig: Rig): Look {
	const look: Look = {
		eyes: undefined as unknown as MeshStandardMaterial,
		rim: { value: 0 },
		light: { value: 0 },
		edge: { value: 0 },
		time: { value: 0 },
		dust: { value: 0 },
		column: { value: new Vector4() },
		inColumn: { value: 0 },
	};
	const meshes: SkinnedMesh[] = [];
	scene.traverse((o) => (o as SkinnedMesh).isSkinnedMesh && meshes.push(o as SkinnedMesh));
	for (const mesh of meshes) {
		let material = mesh.material as MeshStandardMaterial | MeshToonMaterial;
		if (material.name === "EYES") {
			look.eyes = material as MeshStandardMaterial;
			material.color.set("#5a0804");
			material.emissive.set("#ff1a06");
			material.toneMapped = false;
		} else {
			// Skin and teeth drawn like the show: flat bands of light and shade, not smooth plastic.
			material = mesh.material = celOf(material as MeshStandardMaterial);
			if (material.name === "TEETH") material.emissiveIntensity = 0.25;
		}
		// The skin also gets a dark ink line round it, like the show's.
		if (material.name === "SHENLONG") mesh.parent?.add(inkOf(mesh, rig, look));
		// Deeper colour on his skin: the model's texture is pale, which on screen reads washed out.
		const richer = material.name === "SHENLONG" ? 1.45 : 1;
		// How far down him each of this mesh's bones sits, nose 0 to tail 1.
		const along = mesh.skeleton.bones.map((b) => {
			const i = rig.bones.indexOf(b);
			return i < 0 ? 0 : rig.spine[rig.follows[i]].s / rig.length;
		});
		material.onBeforeCompile = (shader) => {
			Object.assign(shader.uniforms, {
				rim: look.rim,
				light: look.light,
				edge: look.edge,
				time: look.time,
				dust: look.dust,
				column: look.column,
				inColumn: look.inColumn,
				along: { value: along },
				grain: { value: dragonLength / rig.length },
			});
			shader.vertexShader = `uniform float along[${along.length}];\nuniform float grain;\nvarying float vAlong;\nvarying vec3 vRest;\nvarying vec3 vWorld;\n${shader.vertexShader}`.replace(
				"#include <skinning_vertex>",
				`#include <skinning_vertex>
				vAlong = dot(skinWeight, vec4(along[int(skinIndex.x)], along[int(skinIndex.y)], along[int(skinIndex.z)], along[int(skinIndex.w)]));
				vRest = position * grain;
				vWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
			);
			shader.fragmentShader = `uniform float rim;\nuniform float light;\nuniform float edge;\nuniform float time;\nuniform float dust;\nuniform vec4 column;\nuniform float inColumn;\nvarying float vAlong;\nvarying vec3 vRest;\nvarying vec3 vWorld;
				float dbHash(vec3 p) { return fract(sin(dot(p, vec3(17.1, 113.7, 41.3))) * 43758.5453); }
				float dbNoise(vec3 p) {
					vec3 i = floor(p), f = fract(p);
					f = f * f * (3.0 - 2.0 * f);
					return mix(
						mix(mix(dbHash(i), dbHash(i + vec3(1, 0, 0)), f.x), mix(dbHash(i + vec3(0, 1, 0)), dbHash(i + vec3(1, 1, 0)), f.x), f.y),
						mix(mix(dbHash(i + vec3(0, 0, 1)), dbHash(i + vec3(1, 0, 1)), f.x), mix(dbHash(i + vec3(0, 1, 1)), dbHash(i + vec3(1, 1, 1)), f.x), f.y),
						f.z);
				}
				${shader.fragmentShader}`.replace(
				"#include <dithering_fragment>",
				`#include <dithering_fragment>
				gl_FragColor.rgb = max(mix(vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114))), gl_FragColor.rgb, ${richer.toFixed(2)}), 0.0);
				float fres = pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 2.5);
				gl_FragColor.rgb += vec3(0.55, 0.85, 0.6) * fres * rim;
				// The light: blotches of yellow drifting over cream, deeper yellow at the edges, and a
				// bright seam where it gives way to him.
				float lit = light * smoothstep(edge - 0.03, edge + 0.03, vAlong);
				float blot = dbNoise(vRest * 3.2 + vec3(0.0, time * 0.7, time * 0.4)) * 0.6 + dbNoise(vRest * 7.0 - vec3(time * 0.5)) * 0.4;
				vec3 glow = mix(vec3(1.0, 0.92, 0.55), vec3(1.0, 0.76, 0.1), smoothstep(0.5, 0.56, blot));
				glow = mix(glow, vec3(1.0, 0.68, 0.05), fres);
				float seam = light * (1.0 - smoothstep(0.0, 0.025, abs(vAlong - edge)));
				gl_FragColor.rgb = mix(gl_FragColor.rgb, glow * 1.6, lit) + vec3(1.0, 0.85, 0.35) * seam * 3.0;
				// Coming up the column: nothing of him beside it (the column's shape: straight, then a point);
				// and while his head is still in it (2), nothing above it either.
				if (inColumn > 0.0) {
					float h = (vWorld.y - column.z) / column.w;
					float wide = h < 0.88 ? 1.1 : h < 0.95 ? mix(1.1, 0.75, (h - 0.88) / 0.07) : mix(0.75, 0.0, (h - 0.95) / 0.05);
					if ((h > 1.0 && inColumn > 1.5) || (h <= 1.0 && length(vWorld.xz - column.xy) > wide * 0.92)) discard;
				}
				// Going to dust: eaten away from the tail, ragged, with a bright, burning edge.
				if (dust > 0.0) {
					float front = 1.0 - dust * 1.15;
					float d = vAlong + (blot - 0.5) * 0.14;
					if (d > front) discard;
					gl_FragColor.rgb += vec3(1.0, 0.8, 0.3) * (1.0 - smoothstep(0.0, 0.035, front - d)) * 3.0;
				}`,
			);
		};
	}
	if (!look.eyes) throw new Error("Shenlong: no eyes");
	return look;
}

/** Three flat tones, shade to light, for the cel shading. */
const tones = (() => {
	const t = new DataTexture(new Uint8Array([120, 195, 255]), 3, 1, RedFormat);
	t.minFilter = t.magFilter = NearestFilter;
	t.generateMipmaps = false;
	t.needsUpdate = true;
	return t;
})();

/** The model's material, cel-shaded: its texture lit in flat bands, with a little glow of its own so the shade isn't black. */
function celOf(from: MeshStandardMaterial) {
	return new MeshToonMaterial({
		name: from.name,
		map: from.map,
		color: from.color,
		emissive: from.emissive,
		emissiveMap: from.emissiveMap,
		emissiveIntensity: 0.3,
		normalMap: from.normalMap,
		gradientMap: tones,
		side: from.side,
		transparent: from.transparent,
		alphaTest: from.alphaTest,
	});
}

/**
 * An ink line round him: his skin again, drawn from behind, swollen a little along its normals and
 * dark, so it shows only as a rim round his edges. Not round the light he comes and goes as.
 */
function inkOf(mesh: SkinnedMesh, rig: Rig, look: Look) {
	const along = mesh.skeleton.bones.map((b) => {
		const i = rig.bones.indexOf(b);
		return i < 0 ? 0 : rig.spine[rig.follows[i]].s / rig.length;
	});
	const ink = new MeshBasicMaterial({ color: "#0a1407", side: BackSide });
	ink.onBeforeCompile = (shader) => {
		// About 3 cm in the sky, in the model's own units.
		Object.assign(shader.uniforms, { thickness: { value: 0.03 / ((dragonLength / rig.length) * girth) }, light: look.light, edge: look.edge, dust: look.dust, along: { value: along } });
		shader.vertexShader = `uniform float thickness;\nuniform float along[${along.length}];\nvarying float vAlong;\n${shader.vertexShader}`
			.replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed += normal * thickness;")
			.replace(
				"#include <skinning_vertex>",
				"#include <skinning_vertex>\nvAlong = dot(skinWeight, vec4(along[int(skinIndex.x)], along[int(skinIndex.y)], along[int(skinIndex.z)], along[int(skinIndex.w)]));",
			);
		shader.fragmentShader = `uniform float light;\nuniform float edge;\nuniform float dust;\nvarying float vAlong;\n${shader.fragmentShader}`.replace(
			"void main() {",
			"void main() {\nif ((light > 0.0 && vAlong > edge - 0.02) || (dust > 0.0 && vAlong > 1.0 - dust * 1.15 - 0.04)) discard;",
		);
	};
	const line = new SkinnedMeshObject(mesh.geometry, ink);
	line.position.copy(mesh.position);
	line.quaternion.copy(mesh.quaternion);
	line.scale.copy(mesh.scale);
	line.bind(mesh.skeleton, mesh.bindMatrix);
	line.frustumCulled = false;
	return line;
}

function useShenlong() {
	const { scene } = useGLTF("/models/shenlong.glb", false);
	// Built once per model and kept on it: building moves the model into the holder, so running it
	// again (as React may, in development) must hand back the same one.
	return useMemo(() => {
		scene.userData.rig ??= buildRig(scene);
		scene.userData.look ??= lookOf(scene, scene.userData.rig);
		return { rig: scene.userData.rig as Rig, look: scene.userData.look as Look };
	}, [scene]);
}
const girth = 1.8;
const scratchRig = { c: new Vector3(), tan: new Vector3(), n: new Vector3(), m: new Matrix4(), r: new Matrix4(), p: new Vector3(), frames: [] as Matrix4[], centres: [] as Vector3[] };

/**
 * Lays his spine along the path, his head at arc length `headArc` (m), and moves every bone with
 * it. A slow, heavy wave runs down him (`calm` 0 holds him straight).
 */
function poseRibbon(rig: Rig, headArc: number, t: number, calm = 1) {
	const { c, tan, n, m, r, p, frames, centres } = scratchRig;
	const scale = dragonLength / rig.length;
	const start = path.getPointAt(0);
	rig.spine.forEach(({ bone, s }, j) => {
		const along = s * scale;
		const arcAt = headArc - along;
		if (arcAt >= 0) {
			path.getPointAt(Math.min(1, arcAt / pathLength), c);
			path.getTangentAt(Math.min(0.999, arcAt / pathLength), tan);
		} else {
			// Still coming up out of the balls: straight down below them.
			c.copy(start).setY(start.y + arcAt);
			tan.set(0, 1, 0);
		}
		// The wave: long and slow, nothing at the head (it holds still to look at you).
		const k = Math.min(1, along / 6) * calm;
		n.crossVectors(tan, Math.abs(tan.y) > 0.98 ? xAxis : yAxis).normalize();
		c.addScaledVector(n, Math.sin(t * 1.1 - along * 0.22) * 0.75 * k);
		c.y += Math.cos(t * 0.9 - along * 0.18) * 0.45 * k + Math.sin(t * 1.4) * 0.06;
		(centres[j] ??= new Vector3()).copy(c);
		p.setFromMatrixPosition(rig.rest[bone]);
		frames[j] ??= new Matrix4();
		frames[j]
			.makeTranslation(c.x, c.y, c.z)
			.multiply(frameOf(tan))
			.multiply(m.makeScale(scale * girth, scale * girth, scale))
			.multiply(r.copy(rig.basis).transpose())
			.multiply(m.makeTranslation(-p.x, -p.y, -p.z));
	});
	// His head is one rigid piece: laid along the curve joint by joint, the head and the jaw (which
	// hangs off the joint behind it) would each turn their own way, and his mouth would split open.
	const neck = neckOf(rig);
	for (let j = 1; j < neck; j++) frames[j].copy(frames[0]);
	const { bones: jaw, hinge } = jawOf(rig);
	rig.bones.forEach((b, i) => {
		b.matrixWorld.multiplyMatrices(frames[rig.follows[i]], jaw.has(i) ? m.multiplyMatrices(hinge, rig.rest[i]) : rig.rest[i]);
	});
}
/**
 * His lower jaw, and the turn about its hinge that closes it most of the way: the model is posed
 * mid-roar, mouth gaping, which looks broken held for the whole wish. A little open still, as if speaking.
 */
const jawOf = (rig: Rig) => {
	if (rig.jaw) return rig.jaw;
	neckOf(rig);
	const fork = rig.bones[rig.spine[(rig.neck as number) - 1].bone];
	const onSpine = new Set(rig.spine.map(({ bone }) => bone));
	const root = fork.children.find((c) => rig.bones.includes(c as Bone) && !onSpine.has(rig.bones.indexOf(c as Bone)));
	const bones = new Set<number>();
	root?.traverse((o) => rig.bones.includes(o as Bone) && bones.add(rig.bones.indexOf(o as Bone)));
	const hinge = new Matrix4();
	if (root) {
		const pivot = new Vector3().setFromMatrixPosition(rig.rest[rig.bones.indexOf(root as Bone)]);
		const side = new Vector3().setFromMatrixColumn(rig.basis, 0);
		hinge
			.makeTranslation(pivot.x, pivot.y, pivot.z)
			.multiply(new Matrix4().makeRotationAxis(side, -0.45))
			.multiply(new Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
	}
	rig.jaw = { bones, hinge };
	return rig.jaw;
};
/** The spine joint behind his head: just behind where the jaw branches off (the last fork along the spine). */
const neckOf = (rig: Rig) => {
	if (rig.neck !== undefined) return rig.neck;
	let fork = 0;
	rig.spine.forEach(({ bone }, j) => {
		if (!fork && rig.bones[bone].children.filter((c) => rig.bones.includes(c as Bone)).length > 1) fork = j;
	});
	rig.neck = Math.min(rig.spine.length - 1, fork + 1);
	return rig.neck;
};
const xAxis = new Vector3(1, 0, 0);
const yAxis = new Vector3(0, 1, 0);

/**
 * Lightning: a jagged bolt from the clouds down into the balls, by splitting each segment in two
 * and knocking the middle sideways (less each time), with a few forks off it. Drawn as flat strips
 * turned to face the camera.
 */
function bolts(from: Vector3[], to: Vector3, eye: Vector3, spread = 7) {
	const strips: { points: Vector3[]; width: number }[] = [];
	const jag = (a: Vector3, b: Vector3, depth: number, spread: number) => {
		let points = [a.clone(), b.clone()];
		for (let d = 0; d < depth; d++, spread *= 0.55) {
			const next = [points[0]];
			for (let i = 0; i < points.length - 1; i++) {
				const mid = points[i].clone().lerp(points[i + 1], 0.5);
				mid.x += (Math.random() - 0.5) * spread;
				mid.z += (Math.random() - 0.5) * spread;
				mid.y += (Math.random() - 0.5) * spread * 0.3;
				next.push(mid, points[i + 1]);
			}
			points = next;
		}
		return points;
	};
	for (const top of from) {
		const main = jag(top, to, 6, spread);
		strips.push({ points: main, width: 1 });
		for (let f = 0; f < 3; f++) {
			const at = main[8 + Math.floor(Math.random() * (main.length - 24))];
			const k = spread / 7;
			const end = at.clone().add(new Vector3((Math.random() - 0.5) * 8 * k, (-2 - Math.random() * 4) * k, (Math.random() - 0.5) * 8 * k));
			strips.push({ points: jag(at, end, 4, 2.5 * k), width: 0.5 });
		}
	}
	const position: number[] = [];
	const side = new Vector3();
	const toEye = new Vector3();
	for (const { points, width } of strips) {
		for (let i = 0; i < points.length - 1; i++) {
			const [a, b] = [points[i], points[i + 1]];
			toEye.copy(eye).sub(a);
			side.copy(b).sub(a).cross(toEye).normalize();
			const [wa, wb] = [(0.025 + a.y * 0.006) * width, (0.025 + b.y * 0.006) * width];
			const [a1, a2, b1, b2] = [a.clone().addScaledVector(side, wa), a.clone().addScaledVector(side, -wa), b.clone().addScaledVector(side, wb), b.clone().addScaledVector(side, -wb)];
			position.push(...a1.toArray(), ...a2.toArray(), ...b1.toArray(), ...a2.toArray(), ...b2.toArray(), ...b1.toArray());
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(position, 3));
	return geometry;
}

/** A dome of storm cloud, drifting and slowly turning about the sky above the balls. */
const cloudShader = {
	vertexShader: /* glsl */ `
		varying vec3 vDir;
		void main() {
			vDir = normalize(position);
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}`,
	fragmentShader: /* glsl */ `
		uniform float time;
		uniform float opacity;
		uniform float flash;
		varying vec3 vDir;
		float hash(vec3 p) { return fract(sin(dot(p, vec3(17.1, 113.7, 41.3))) * 43758.5453); }
		float noise(vec3 p) {
			vec3 i = floor(p), f = fract(p);
			f = f * f * (3.0 - 2.0 * f);
			return mix(
				mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
				mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
				f.z);
		}
		float fbm(vec3 p) {
			float v = 0.0, a = 0.5;
			for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; }
			return v;
		}
		void main() {
			// A slow turn about the zenith, faster overhead: the vortex the dragon comes out of.
			float turn = time * 0.04 * (0.4 + max(vDir.y, 0.0));
			vec3 d = vDir;
			d.xz = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * d.xz;
			float n = fbm(d * 3.2 + vec3(time * 0.02, 0.0, time * 0.015));
			float body = smoothstep(0.3, 0.75, n);
			vec3 colour = mix(vec3(0.012, 0.018, 0.024), vec3(0.07, 0.09, 0.1), body);
			// Lightning lights the cloud from inside, yellow-white.
			colour += flash * vec3(0.95, 0.85, 0.5) * (0.3 + body);
			float a = opacity * (0.93 + 0.07 * body) * smoothstep(-0.45, -0.2, vDir.y);
			gl_FragColor = vec4(colour, a);
		}`,
};

/** The summon, step by step, and how long each step lasts (s). The stare waits for a wish. */
export type Stage = "off" | "hush" | "glow" | "strike" | "arrive" | "stare" | "grant" | "leave";
const lasts: Record<Exclude<Stage, "off" | "stare">, number> = { hush: 1.6, glow: 7, strike: 2.2, arrive: 11, grant: 3.2, leave: 11 };
/**
 * The arrival's beats (s into it): he shoots up out of the balls as a column of light, bends off it
 * into the storm without slowing, and the light's head breaks out as his, the rest following.
 */
const reveal = { at: 4.5, over: 3.5 };
/** When the camera swings round to face him as he comes down. */
const faceHim = { at: 7, over: 4 };
/**
 * The departure's beats (s into it): he turns back to light, from the tail up; bursts into sparks
 * until the last of him goes; the balls rise, launch up into the storm together, and scatter.
 */
const exit = { light: 1.6, burst: 1.8, gone: 4.4, rise: 5.6, launch: 7.2, scatter: 9 };
/** The wishes on offer. Fixing all your bugs is beyond even him. */
export type WishKind = "credits" | "sky" | "bugs" | "maker" | SceneWish;
/** The wishes granted in the scene itself, once he's gone. */
export type SceneWish = "fireworks" | "spring" | "stars" | "moon" | "gold";
export const sceneWishes: SceneWish[] = ["fireworks", "spring", "stars", "moon", "gold"];
/** A scene wish as granted, numbered so the same one granted again starts over. */
export type Granted = { kind: SceneWish; n: number };
export type SummonApi = { wish: (kind: WishKind) => void; skip: () => void; summon: () => void };

type Summon = {
	stage: Exclude<Stage, "off">;
	t: number;
	/** The balls' heartbeat: when the next beat comes, and how much of the last is left. */
	beat: number;
	pulse: number;
	/** Lightning in the clouds, fading. */
	flash: number;
	reroll: number;
	/** Stops the storm's wind, while it blows. */
	wind: (() => void) | null;
	/** Whether the record was playing (it comes back on after). */
	record: boolean;
	/** What the sky, fog and lens were, to put back. */
	bg: Color;
	fogColor: Color;
	fog: [number, number];
	fov: number;
	wish: WishKind | null;
	/** His glare when asked for something beyond him, fading. */
	scowl: number;
	/** A ball of light going off (the last of him, the balls scattering): how much is left, and how big. */
	pop: number;
	popSize: number;
};

const storm = new Color("#04060a");
const glowLight = new Color("#ffa63a");
/** Where you watch him go from: back, so all of him is in frame, looking into the middle of his coils. */
const wideOut = new Vector3(1.2, 2, 11);
const coils = new Vector3(-1.5, 9.5, -4);
const pedestalTop = new Vector3(pedestal.at[0], pedestal.height + r, pedestal.at[2]);
const across = { side: new Vector3(), up: new Vector3(), ahead: new Vector3() };

/**
 * Where a ball is as they go, `t` s into the departure, and how much of it is left: they rise off
 * the pedestal together, launch up into the storm drawing apart a little, then scatter, each its own
 * way across the sky, burning out.
 */
function flight(ball: BallState, i: number, t: number, out: Vector3, camera: Camera) {
	const [cx, cy, cz] = ball.cup;
	const rise = smooth(clamp01((t - exit.rise) / 1.4)) * 0.9;
	const up = clamp01((t - exit.launch) / (exit.scatter - exit.launch));
	const apart = 1 + up * 2.5;
	out.set(pedestalTop.x + (cx - pedestalTop.x) * apart, cy + rise + 15 * up ** 2.2, pedestalTop.z + (cz - pedestalTop.z) * apart);
	if (t < exit.scatter) return 1;
	const k = t - exit.scatter;
	const a = (i / 7) * Math.PI * 2 + 0.4;
	const { side, up: lift, ahead } = across;
	side.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(Math.cos(a));
	side.addScaledVector(lift.setFromMatrixColumn(camera.matrixWorld, 1), Math.sin(a)).addScaledVector(ahead.setFromMatrixColumn(camera.matrixWorld, 2), i % 2 ? 0.4 : -0.4);
	out.addScaledVector(side, 9 * (1 - Math.exp(-2.2 * k)));
	return 1 - smooth(clamp01(k / 1.4));
}

/** The column of light: a tall tube with a pointed top, its height 1 (scaled to how far it's grown). */
const column = new LatheGeometry([new Vector2(1.1, 0), new Vector2(1.1, 0.88), new Vector2(0.75, 0.95), new Vector2(0, 1)], 32);
/** Bright yellow-white where it faces you, deep yellow and fading to nothing at its edges. */
const columnShader = {
	vertexShader: /* glsl */ `
		varying vec3 vNormal;
		varying vec3 vView;
		void main() {
			vec4 mv = modelViewMatrix * vec4(position, 1.0);
			vNormal = normalize(normalMatrix * normal);
			vView = normalize(-mv.xyz);
			gl_Position = projectionMatrix * mv;
		}`,
	fragmentShader: /* glsl */ `
		uniform float opacity;
		varying vec3 vNormal;
		varying vec3 vView;
		void main() {
			float facing = abs(dot(normalize(vNormal), normalize(vView)));
			vec3 colour = mix(vec3(1.0, 0.7, 0.08), vec3(1.0, 0.95, 0.7), smoothstep(0.2, 0.9, facing)) * (1.1 + 0.8 * facing);
			gl_FragColor = vec4(colour, opacity * smoothstep(0.0, 0.5, facing));
		}`,
};

/** A streak: a cone from the ball (its wide end) trailing back to a point. */
const streak = new ConeGeometry(1, 1, 10, 1, true).translate(0, 0.5, 0);

/** A soft round glow, white in the middle and fading out, for the sparks and the bursts of light. */
export function softDot() {
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = 64;
	const g = canvas.getContext("2d") as CanvasRenderingContext2D;
	const fade = g.createRadialGradient(32, 32, 0, 32, 32, 32);
	fade.addColorStop(0, "rgba(255,255,255,1)");
	fade.addColorStop(0.25, "rgba(255,255,255,0.8)");
	fade.addColorStop(1, "rgba(255,255,255,0)");
	g.fillStyle = fade;
	g.fillRect(0, 0, 64, 64);
	return new CanvasTexture(canvas);
}

export function DragonBalls({
	controls,
	hold,
	onDone,
	onStage,
	api,
	onWish,
	open,
}: {
	controls: React.RefObject<OrbitControlsImpl | null>;
	hold: React.RefObject<boolean>;
	onDone: () => void;
	/** Each step of the summon as it starts, for the words and buttons over the scene. */
	onStage: (stage: Stage) => void;
	/** Filled in here: how the words and buttons over the scene make a wish, or skip ahead. */
	api: React.RefObject<SummonApi | null>;
	/** A wish granted, once he's gone and the sky's back. */
	onWish: (kind: WishKind) => void;
	/** Out under the sky (with the sakura), not in the room. */
	open: boolean;
}) {
	const { camera, scene } = useThree();
	const { say, record, toggleRecord } = useView();
	const balls = useRef<BallState[]>([
		{ stars: 4, home: cups[0], cup: cups[0], phase: "placed", t: 1, stone: 0, back: 1, last: new Vector3() },
		...hidden.map((h, i): BallState => ({ stars: h.stars, home: h.stars === 7 && !open ? indoors : h.at, cup: cups[i + 1], phase: "hidden", t: 0, stone: 0, back: 1, last: new Vector3() })),
	]);
	const groups = useRef<(Group | null)[]>([]);
	const flares = useRef<(Group | null)[]>([]);
	const [count, setCount] = useState(1);
	const summon = useRef<Summon | null>(null);
	const glow = useRef(0.22);

	const models = useBallModels();
	const { rig: dragon, look } = useShenlong();
	const lightning = useRef<Mesh>(null);
	const clouds = useMemo(() => new ShaderMaterial({ ...cloudShader, uniforms: { time: { value: 0 }, opacity: { value: 0 }, flash: { value: 0 } }, transparent: true, depthWrite: false, side: BackSide, fog: false }), []);
	const cloudDome = useRef<Mesh>(null);
	const ballLight = useRef<PointLight>(null);
	const headLight = useRef<PointLight>(null);
	const rimLight = useRef<DirectionalLight>(null);
	const boltLight = useRef<DirectionalLight>(null);
	const pop = useRef<Sprite>(null);
	const beam = useRef<Mesh>(null);
	const beamLook = useMemo(() => new ShaderMaterial({ ...columnShader, uniforms: { opacity: { value: 0 } }, transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, fog: false }), []);
	const dot = useMemo(softDot, []);
	const sparks = useMemo(() => {
		const n = 2500;
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(n * 3), 3));
		geometry.setAttribute("color", new Float32BufferAttribute(new Float32Array(n * 3), 3));
		return { n, geometry, velocity: new Float32Array(n * 3), life: new Float32Array(n), bright: new Float32Array(n) };
	}, []);
	const sparkPoints = useRef<Points>(null);
	const scratch = useMemo(() => ({ v: new Vector3(), w: new Vector3(), look: new Vector3(), eye: new Vector3(), cluster: new Vector3(), aim: new Vector3() }), []);

	const collect = (i: number) => (event: ThreeEvent<MouseEvent>) => {
		const ball = balls.current[i];
		if (!isTap(event) || ball.phase !== "hidden" || summon.current) return;
		event.stopPropagation();
		ball.phase = "flying";
		ball.t = 0;
		preloadSummon();
		play("chime");
		whoosh(1);
	};

	const go = (s: Summon, stage: Summon["stage"]) => {
		s.stage = stage;
		s.t = 0;
		onStage(stage);
	};

	const startSummon = () => {
		const c = controls.current;
		if (!c) return;
		hold.current = true;
		c.enabled = false;
		Object.assign(c, { minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity, minPolarAngle: 0, maxPolarAngle: Math.PI, minDistance: 0, maxDistance: Infinity });
		const fog = scene.fog as Fog;
		const lens = camera as PerspectiveCamera;
		// Everything goes quiet first: the record lifts, the room's hum and crickets fall away.
		if (record) toggleRecord();
		hushAmbience(true);
		summon.current = {
			stage: "hush",
			t: 0,
			beat: 0.4,
			pulse: 0,
			flash: 0,
			reroll: 0,
			wind: null,
			record,
			bg: (scene.background as Color).clone(),
			fogColor: fog.color.clone(),
			fog: [fog.near, fog.far],
			fov: lens.fov,
			wish: null,
			scowl: 0,
			pop: 0,
			popSize: 1,
		};
		onStage("hush");
		say(null);
	};

	/** Straight to the dragon waiting for the wish: the storm in, him coiled across the sky. */
	const skip = () => {
		const s = summon.current;
		if (!s || s.stage === "stare" || s.stage === "grant" || s.stage === "leave") return;
		s.wind ??= stormWind();
		go(s, "stare");
		camera.position.copy(stareAt);
		controls.current?.target.copy(head);
	};

	const grant = (kind: WishKind | null) => {
		const s = summon.current;
		if (!s || s.stage !== "stare") return;
		// Beyond his power: a glare and a growl, and he waits for another.
		if (kind === "bugs") {
			s.scowl = 1;
			s.flash = Math.max(s.flash, 0.9);
			s.t = 0;
			rumble(2.2);
			return;
		}
		s.wish = kind;
		go(s, "grant");
		bigRoar();
	};
	api.current = { wish: grant, skip, summon: () => !summon.current && startSummon() };

	// Leaving mid-summon (or for the wish that takes you away): the wind mustn't blow on after.
	useEffect(() => () => summon.current?.wind?.(), []);

	const finish = () => {
		const s = summon.current;
		if (!s) return;
		summon.current = null;
		s.wind?.();
		(scene.background as Color).copy(s.bg);
		const fog = scene.fog as Fog;
		fog.color.copy(s.fogColor);
		[fog.near, fog.far] = s.fog;
		const lens = camera as PerspectiveCamera;
		lens.fov = s.fov;
		lens.updateProjectionMatrix();
		hold.current = false;
		// Burst to nothing, the balls turn up again a little later, stone, the four-star on its pedestal
		// and the rest in their hiding places.
		for (const ball of balls.current) {
			ball.phase = ball.stars === 4 ? "placed" : "hidden";
			ball.stone = 1;
			ball.back = -1.5;
		}
		setCount(1);
		hushAmbience(false);
		// The record comes back on, unless the wish takes you off to another page.
		if (s.record && s.wish !== "maker") toggleRecord();
		onStage("off");
		onDone();
		// Granted now the sky's its own again (a new palette mustn't be painted over by the storm's).
		if (s.wish) onWish(s.wish);
	};

	useFrame(({ clock }, dt) => {
		const t = clock.elapsedTime;
		const { v, w, look: target, eye, cluster, aim } = scratch;
		const s = summon.current;

		// The balls: bobbing where they hide, arcing to their cups, sitting there, and flying off as he goes.
		let placed = 0;
		balls.current.forEach((ball, i) => {
			const g = groups.current[i];
			if (!g) return;
			ball.last.copy(g.position);
			let size = 1;
			const going = s?.stage === "leave" && ball.phase === "placed";
			if (ball.phase === "flying") {
				ball.t = Math.min(1, ball.t + dt / 1.4);
				g.position.copy(arc(ball.home, ball.cup, smooth(ball.t), v));
				g.rotation.y += dt * 8;
				if (ball.t >= 1) ball.phase = "placed";
			} else if (going) {
				size = flight(ball, i, s.t, v, camera);
				g.position.copy(v);
			} else {
				const at = ball.phase === "placed" ? ball.cup : ball.home;
				g.position.set(at[0], at[1] + (ball.phase === "hidden" && !still() ? Math.sin(t * 1.6 + i) * 0.006 : 0), at[2]);
			}
			// Back from bursting: after a wait, growing back where it hides now, and coming back to life.
			if (!s) {
				ball.back = Math.min(1, ball.back + dt / 1.2);
				ball.stone = Math.max(0, ball.stone - dt / 6);
			}
			if (!going) size = smooth(clamp01(ball.back));
			g.scale.setScalar(Math.max(0.001, size));
			if (ball.phase === "placed") placed++;
			// Each ball faces you, so its stars read. (The stars lie flat in the middle of the ball, facing up its Y axis.)
			if (ball.phase !== "flying") g.quaternion.setFromUnitVectors(yAxis, v.copy(camera.position).sub(g.position).normalize());
			const m = models[ball.stars];
			if (m) {
				const level = (ball.phase === "placed" || s ? glow.current : 0.25) * (1 - ball.stone);
				m.shell.emissiveIntensity = level * 0.8;
				m.back.emissiveIntensity = (0.35 + level * 0.6) * (1 - ball.stone * 0.9);
				m.stars.emissiveIntensity = (1.2 + level) * (1 - ball.stone * 0.8);
				m.back.color.set("#ff8a1a").lerp(stoneGrey, ball.stone);
				m.shell.color.copy(m.shellColour).lerp(stoneGrey, ball.stone);
			}
			// In flight, each burns like a little star with a streak behind it.
			const f = flares.current[i];
			if (f) {
				f.visible = going && s.t > exit.rise && size > 0.01;
				if (f.visible && s) {
					const up = clamp01((s.t - exit.launch) / 0.6);
					f.position.copy(g.position);
					const [core, tail] = f.children as MeshObject[];
					const width = (r * 1.4 + (camera.position.distanceTo(g.position) * 0.016 - r * 1.4) * up) * size;
					core.scale.setScalar(width);
					(core.material as MeshBasicMaterial).opacity = 0.3 + 0.7 * up;
					w.copy(g.position).sub(ball.last);
					const speed = w.length() / Math.max(dt, 1e-3);
					tail.visible = speed > 0.8;
					if (tail.visible) {
						tail.quaternion.setFromUnitVectors(yAxis, w.normalize().negate());
						tail.scale.set(width * 0.8, Math.min(7, speed * 0.14) * size, width * 0.8);
					}
				}
			}
		});
		if (placed !== count) setCount(placed);
		if (placed === 7 && !s) startSummon();

		const c = controls.current;
		if (!s || !c) {
			dragon.holder.visible = false;
			return;
		}
		s.t += dt;
		const reduced = still();
		const lens = camera as PerspectiveCamera;
		const fog = scene.fog as Fog;
		cluster.copy(groups.current[0]?.position ?? pedestalTop);

		// How far into the storm we are (0 to 1): it builds through the glow, holds, and clears as the balls go.
		const dark = s.stage === "hush" ? 0 : s.stage === "glow" ? smooth(clamp01(s.t / lasts.glow)) : s.stage === "leave" ? 1 - smooth(clamp01((s.t - exit.scatter - 0.2) / 1.8)) : 1;
		(scene.background as Color).copy(s.bg).lerp(storm, dark);
		fog.color.copy(s.fogColor).lerp(storm, dark);
		// The fog pulls back so the whole of him shows against the cloud.
		fog.near = s.fog[0] + (18 - s.fog[0]) * dark;
		fog.far = s.fog[1] + (60 - s.fog[1]) * dark;
		clouds.uniforms.time.value = t;
		clouds.uniforms.opacity.value = dark;
		if (cloudDome.current) cloudDome.current.visible = dark > 0.001;
		// A wide lens from the ground, so he towers; wider still to watch him go; then back to the room's.
		const lensGoal =
			s.stage === "strike" || s.stage === "arrive" || s.stage === "stare" || s.stage === "grant"
				? 55
				: s.stage === "leave"
					? s.t < exit.gone + 1.2
						? 62
						: s.t < exit.scatter
							? 50
							: s.fov
					: lens.fov;
		lens.fov += (lensGoal - lens.fov) * Math.min(1, dt * 2);
		lens.updateProjectionMatrix();

		// The balls' heartbeat: slow at first, quicker and brighter as it builds.
		const build = s.stage === "glow" ? s.t / lasts.glow : 0;
		if (s.stage === "glow") {
			s.beat -= dt;
			if (s.beat <= 0) {
				s.pulse = 1;
				s.beat = 1.15 - build * 0.7;
				heartbeat(build);
			}
		}
		s.pulse *= Math.exp(-dt * 4);
		glow.current =
			s.stage === "hush"
				? 0.4
				: s.stage === "glow"
					? 0.4 + build * 1.8 + s.pulse * (0.6 + build)
					: s.stage === "strike"
						? 3.5
						: s.stage === "leave"
							? s.t < exit.rise
								? 0.8
								: 2
							: 1.2;
		if (ballLight.current) {
			ballLight.current.position.copy(cluster).setY(cluster.y + 0.15);
			ballLight.current.intensity = glow.current * 3 * (s.stage === "leave" && s.t > exit.scatter ? 1 - clamp01((s.t - exit.scatter) / 0.8) : 1);
		}

		// Him: where his head is along the path (shooting up out of the balls, speeding, slowing into the
		// coil, then held), and how much of him is still light.
		const headArc =
			s.stage === "arrive"
				? pathLength * (1 - (1 - clamp01(s.t / lasts.arrive)) ** 1.6)
				: s.stage === "stare" || s.stage === "grant" || s.stage === "leave"
					? pathLength
					: 0;
		const shown = s.stage === "arrive" || s.stage === "stare" || s.stage === "grant" || (s.stage === "leave" && s.t < exit.gone + 0.05);
		dragon.holder.visible = shown;
		// Straight as a beam on his way up; his wave comes into him as he bends off into the storm.
		if (shown) poseRibbon(dragon, headArc, t, s.stage === "arrive" ? smooth(clamp01((headArc - straightUp * 0.6) / 14)) : 1);
		look.dust.value = s.stage === "leave" ? clamp01((s.t - exit.burst) / (exit.gone - exit.burst)) : 0;

		// The column of light round him on his way up: its top rides just over his head (hiding it)
		// while he's going straight up, stops where he bends off, and fades off him as he goes on.
		if (beam.current) {
			const left = s.stage === "arrive" ? 1 - smooth(clamp01((headArc - straightUp) / 12)) : 0;
			beam.current.visible = left > 0.001;
			beam.current.scale.set(1, Math.max(0.001, Math.min(headArc, straightUp) + 2), 1);
			beamLook.uniforms.opacity.value = left;
			look.column.value.set(pedestalTop.x, pedestalTop.z, pedestalTop.y, beam.current.scale.y);
		}
		// While his head is still going straight up he's all inside the column; past its top his head is out,
		// but nothing pokes from its sides until the column has mostly gone.
		look.inColumn.value = s.stage !== "arrive" ? 0 : headArc < straightUp ? 2 : beamLook.uniforms.opacity.value > 0.35 ? 1 : 0;
		const headNow = scratchRig.centres[0] ?? head;
		look.time.value = t;
		if (s.stage === "arrive") {
			// All light as he comes; then the light's head breaks open into his, and the rest follows down him.
			look.light.value = 1;
			look.edge.value = -0.1 + 1.25 * smooth(clamp01((s.t - reveal.at) / reveal.over));
		} else if (s.stage === "leave") {
			// Back to light, from the tail up to his nose.
			look.light.value = 1;
			look.edge.value = 1.15 - 1.3 * smooth(clamp01(s.t / exit.light));
		} else look.light.value = 0;
		const lightLeft = look.light.value * (1 - clamp01(look.edge.value));
		// The light he's made of, at his head; once he's himself, a warm glow stays on his face (a little
		// towards you), so he doesn't drop into the storm's gloom.
		if (headLight.current) {
			headLight.current.position.copy(headNow).lerp(camera.position, 0.05).y += 2;
			headLight.current.intensity = shown ? Math.max(lightLeft * 40, 13 * (1 - look.dust.value)) : 0;
		}
		// His eyes: lit as he comes, blazing as he looks at you, a glare when you ask too much, a flash as he grants it.
		s.scowl *= Math.exp(-dt * 1.5);
		look.eyes.emissiveIntensity = s.stage === "grant" ? 10 + 14 * Math.exp(-s.t * 2) : s.stage === "stare" ? 10 + Math.sin(t * 2.2) * 1.5 + s.scowl * 14 : 8;
		if (s.stage === "arrive" && Math.abs(s.t - reveal.at) < dt / 2) bigRoar();
		if (s.stage === "arrive" && s.t - dt <= 0) whoosh(1.6);
		if (s.stage === "stare" && Math.abs(s.t - 0.6) < dt / 2 && s.scowl < 0.01) rumble(2.5);

		// Lightning in the clouds now and then while the storm gathers; then the strike into the balls;
		// and crackling round his head as it breaks out of the light.
		if (s.stage === "glow" && [2.6, 4.7, 5.5, 6.4].some((at) => Math.abs(s.t - at) < dt / 2)) {
			s.flash = 0.5 + Math.random() * 0.3;
			rumble(1.6);
		}
		if (s.stage === "glow" && s.t > 0.2) s.wind ??= stormWind();
		const striking = s.stage === "strike" || (s.stage === "arrive" && s.t < 1);
		const crackling = s.stage === "arrive" && s.t > reveal.at - 0.3 && s.t < reveal.at + 1;
		if (s.stage === "strike" && s.t - dt <= 0) {
			s.flash = 1.6;
			bigThunder();
		}
		if (s.stage === "arrive" && s.t - dt <= 0) s.flash = 1.4;
		if (striking || crackling) {
			s.reroll -= dt;
			if (s.reroll <= 0 && lightning.current) {
				s.reroll = 0.06 + Math.random() * 0.06;
				lightning.current.geometry.dispose();
				lightning.current.geometry = striking
					? bolts(
							Array.from({ length: s.stage === "strike" ? 3 : 2 }, () => w.set(pedestal.at[0] + (Math.random() - 0.5) * 10, 24, pedestal.at[2] - 4 + (Math.random() - 0.5) * 10).clone()),
							pedestalTop,
							camera.position,
						)
					: bolts(
							Array.from({ length: 2 }, () => w.copy(headNow).add(v.set((Math.random() - 0.5) * 9, 2 + Math.random() * 4, (Math.random() - 0.5) * 9)).clone()),
							headNow,
							camera.position,
							2.2,
						);
				s.flash = Math.max(s.flash, striking ? 0.6 + Math.random() * 0.5 : 0.4 + Math.random() * 0.3);
			}
		}
		if (lightning.current) lightning.current.visible = (striking || crackling) && Math.random() > 0.12;
		s.flash *= Math.exp(-dt * 6);
		clouds.uniforms.flash.value = s.flash;
		if (boltLight.current) boltLight.current.intensity = s.flash * 5;
		if (rimLight.current) rimLight.current.intensity = dark * 2.2;
		look.rim.value = dark * 0.25;

		// Going: a roar of wind as the light floods back up him, a flash as the last of him goes, and
		// the balls' launch and scatter.
		if (s.stage === "leave") {
			const at = (when: number) => s.t - dt < when && s.t >= when;
			if (at(0.1)) {
				whoosh(2);
				rumble(2);
			}
			if (at(exit.gone - 0.05)) {
				s.flash = 1.1;
				s.pop = 1;
				s.popSize = 9;
				pop.current?.position.copy(head);
				rumble(2.5);
				play("chime");
			}
			if (at(exit.launch)) whoosh(1.8);
			if (at(exit.scatter)) {
				s.flash = Math.max(s.flash, 0.6);
				s.pop = 1;
				s.popSize = 3;
				pop.current?.position.copy(cluster);
				s.wind?.();
				s.wind = null;
				whoosh(1.2);
				play("chime");
			}
		}
		s.pop *= Math.exp(-dt * 3.5);
		if (pop.current) {
			pop.current.visible = s.pop > 0.01;
			pop.current.scale.setScalar(s.popSize * (1.15 - s.pop));
			(pop.current.material as SpriteMaterial).opacity = s.pop;
		}

		// Dust and sparks off the burning edge as he goes, drifting and fading after him.
		const sp = sparkPoints.current;
		if (sp) {
			sp.visible = s.stage === "leave" && s.t > exit.burst && s.t < exit.gone + 1.4;
			if (sp.visible) {
				const pos = sparks.geometry.attributes.position as BufferAttribute;
				const col = sparks.geometry.attributes.color as BufferAttribute;
				const dust = look.dust.value;
				const front = 1 - dust * 1.15;
				const fade = 1 - clamp01((s.t - exit.gone) / 1.4);
				for (let i = 0; i < sparks.n; i++) {
					sparks.life[i] -= dt;
					if (sparks.life[i] <= 0 && dust > 0 && front > -0.05) {
						// The joint nearest that far down him (they're not evenly spaced).
						const at = clamp01(front + (Math.random() - 0.5) * 0.06) * dragon.length;
						let j = 0;
						while (j < dragon.spine.length - 1 && dragon.spine[j + 1].s <= at) j++;
						const from = scratchRig.centres[j];
						const next = scratchRig.centres[Math.min(j + 1, dragon.spine.length - 1)];
						if (!from) continue;
						// Where he's far off, or his body runs towards you (or away), a long stretch of him is one
						// small patch of screen, and its dust would pile up there into a bright clump (it adds up):
						// shed less of it there, so it stays about as thick on screen everywhere.
						if (next && next !== from) {
							const off = aim.subVectors(from, camera.position).length();
							const endOn = Math.abs(w.subVectors(next, from).normalize().dot(aim.normalize()));
							// (Measured against the middle of him, so only what's further off than most of him thins.)
							const middle = scratchRig.centres[dragon.spine.length >> 1] ?? from;
							const keep = Math.sqrt(1 - endOn * endOn) * Math.min(1, (middle.distanceTo(camera.position) / off) ** 1.5);
							if (Math.random() > Math.max(0.08, keep)) {
								col.setXYZ(i, 0, 0, 0);
								continue;
							}
						}
						v.randomDirection().multiplyScalar(Math.random() * 0.7).add(from);
						pos.setXYZ(i, v.x, v.y, v.z);
						// Mostly dust, slow and dim; now and then a spark, flung.
						const spark = Math.random() < 0.2;
						w.randomDirection().multiplyScalar(spark ? 2.5 + Math.random() * 2 : 0.2 + Math.random() * 0.5);
						sparks.velocity.set([w.x, w.y + (spark ? 1 : 0.4), w.z], i * 3);
						sparks.life[i] = spark ? 0.6 + Math.random() * 0.8 : 1.2 + Math.random() * 1.6;
						sparks.bright[i] = spark ? 1 : 0.35 + Math.random() * 0.35;
					}
					if (sparks.life[i] <= 0) {
						col.setXYZ(i, 0, 0, 0);
						continue;
					}
					const drag = Math.exp(-dt * 1.4);
					for (let a = 0; a < 3; a++) sparks.velocity[i * 3 + a] *= drag;
					pos.setXYZ(i, pos.getX(i) + sparks.velocity[i * 3] * dt, pos.getY(i) + sparks.velocity[i * 3 + 1] * dt, pos.getZ(i) + sparks.velocity[i * 3 + 2] * dt);
					const k = Math.min(1, sparks.life[i]) * sparks.bright[i] * fade;
					col.setXYZ(i, 3.2 * k, 2.4 * k, 0.8 * k);
				}
				pos.needsUpdate = true;
				col.needsUpdate = true;
			}
		}

		// The camera, shot by shot.
		if (s.stage === "hush" || s.stage === "glow") {
			// Low by the pedestal, looking up past the balls at the darkening sky.
			w.set(pedestal.at[0] + 0.69, 0.32, pedestal.at[2] + 1.38);
			target.copy(pedestalTop).setY(pedestal.height + 0.3 + (s.stage === "glow" ? smooth(clamp01(s.t / lasts.glow)) * 0.35 : 0));
			camera.position.lerp(w, Math.min(1, dt * (s.stage === "hush" ? 1.4 : 0.6)));
			c.target.lerp(target, Math.min(1, dt * 1.5));
		} else if (s.stage === "strike") {
			// Tilting up the lightning.
			target.copy(pedestalTop).setY(pedestal.height + 0.3 + smooth(clamp01(s.t / lasts.strike)) * 1.5);
			c.target.lerp(target, Math.min(1, dt * 3));
			camera.position.lerp(w.set(0.9, 0.3, 4.4), Math.min(1, dt * 1.2));
		} else if (s.stage === "arrive") {
			// From the ground, watching the light shoot up and following its head round; then round to
			// face him as it breaks open and he comes down.
			const late = smooth(clamp01((s.t - faceHim.at) / faceHim.over));
			w.set(1.8, 0.35, 3.9).lerp(stareAt, late);
			camera.position.lerp(w, Math.min(1, dt * 1.2));
			c.target.lerp(headNow, Math.min(1, dt * 4));
		} else if (s.stage === "stare" || s.stage === "grant") {
			// Face to face: easing slowly in towards him.
			eye.copy(stareAt).lerp(head, Math.min(0.35, s.t * 0.02));
			camera.position.lerp(eye, Math.min(1, dt * 1.5));
			c.target.lerp(headNow, Math.min(1, dt * 3));
		} else if (s.t < exit.gone + 1.2) {
			// Pulling right back, to see all of him go up in light.
			const k = smooth(clamp01(s.t / 3.2));
			camera.position.lerp(eye.copy(stareAt).lerp(wideOut, k), Math.min(1, dt * 3));
			c.target.lerp(target.copy(head).lerp(coils, k), Math.min(1, dt * 3));
		} else if (s.t < exit.launch) {
			// Down to the pedestal, to see the balls rise.
			camera.position.lerp(w.set(0.9, 0.9, 3.4), Math.min(1, dt * 1.6));
			c.target.lerp(cluster, Math.min(1, dt * 2));
		} else {
			// Following them up from below, and holding as they scatter.
			camera.position.lerp(w.set(1.1, 0.5, 4.4), Math.min(1, dt * 1.2));
			if (s.t < exit.scatter) c.target.lerp(cluster, Math.min(1, dt * 4));
		}
		// The controls are off, so nothing else turns the camera: point it here.
		camera.lookAt(c.target);

		// On to the next step.
		if (s.stage === "hush" && s.t > lasts.hush) {
			if (reduced) skip();
			else go(s, "glow");
		} else if (s.stage === "glow" && s.t > lasts.glow) go(s, "strike");
		else if (s.stage === "strike" && s.t > lasts.strike) go(s, "arrive");
		else if (s.stage === "arrive" && s.t > lasts.arrive) go(s, "stare");
		else if (s.stage === "stare" && s.t > 45) grant(null);
		else if (s.stage === "grant" && s.t > lasts.grant) go(s, "leave");
		else if (s.stage === "leave" && s.t > lasts.leave) finish();
	});

	return (
		<group>
			{/* The pedestal: a dark stone plinth with a lit rim and seven cups. */}
			<group position={pedestal.at}>
				<mesh position={[0, pedestal.height / 2, 0]} castShadow receiveShadow>
					<cylinderGeometry args={[0.18, 0.21, pedestal.height, 24]} />
					<meshStandardMaterial color="#1b1a22" roughness={0.85} />
				</mesh>
				<mesh position={[0, pedestal.height - 0.01, 0]}>
					<cylinderGeometry args={[0.2, 0.2, 0.025, 32]} />
					<meshStandardMaterial color="#2a2833" roughness={0.6} metalness={0.3} />
				</mesh>
				<mesh position={[0, pedestal.height + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
					<ringGeometry args={[0.192, 0.2, 48]} />
					<meshBasicMaterial color={[2.2, 1.3, 0.3]} toneMapped={false} />
				</mesh>
			</group>
			{/* The balls' own light, washing the pedestal and floor as they glow up, and going with them. */}
			<pointLight ref={ballLight} color={glowLight} intensity={0} distance={6} decay={1.6} />
			{balls.current.map((ball, i) => (
				<group key={ball.stars} ref={(g) => void (groups.current[i] = g)}>
					{models[ball.stars] && <primitive object={models[ball.stars].group} />}
					{/* A generous invisible handle: the balls are small. */}
					<mesh
						onClick={collect(i)}
						onPointerOver={(e) => {
							if (ball.phase !== "hidden" || summon.current) return;
							e.stopPropagation();
							document.body.style.cursor = "pointer";
							say(`A dragon ball? (${count} of 7)`);
						}}
						onPointerOut={() => {
							document.body.style.cursor = "";
							say(null);
						}}
					>
						<sphereGeometry args={[0.11, 12, 8]} />
						<meshBasicMaterial transparent opacity={0} depthWrite={false} />
					</mesh>
				</group>
			))}
			{/* Each ball's glow and streak as they fly. */}
			{balls.current.map((ball, i) => (
				<group key={`flare-${ball.stars}`} ref={(g) => void (flares.current[i] = g)} visible={false}>
					<mesh renderOrder={6}>
						<sphereGeometry args={[1, 16, 12]} />
						<meshBasicMaterial color={[3.2, 2.3, 0.7]} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
					</mesh>
					<mesh geometry={streak} renderOrder={6}>
						<meshBasicMaterial color={[2.6, 2, 0.5]} transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} side={2} toneMapped={false} fog={false} />
					</mesh>
				</group>
			))}
			{/* The storm: a dome of cloud over everything, drawn over the stars and the moon; the light shows through it. */}
			<mesh ref={cloudDome} material={clouds} renderOrder={5} visible={false}>
				<sphereGeometry args={[26, 48, 24]} />
			</mesh>
			{/* A cold light from behind and above, catching his edges; the lightning's own; and the light he's made of. */}
			<directionalLight ref={rimLight} position={[-4, 14, -20]} color="#9cc8ff" intensity={0} />
			<directionalLight ref={boltLight} position={[pedestal.at[0], 20, pedestal.at[2] + 4]} color="#ffe9a8" intensity={0} />
			<pointLight ref={headLight} color="#ffd25a" intensity={0} distance={35} decay={1} />
			{/* The column of light he comes as. */}
			<mesh ref={beam} geometry={column} material={beamLook} position={pedestalTop} visible={false} renderOrder={6} frustumCulled={false} />
			{/* Yellow lightning, re-drawn every few frames. */}
			<mesh ref={lightning} visible={false} frustumCulled={false} renderOrder={6}>
				<bufferGeometry />
				<meshBasicMaterial color={[4, 3.4, 1.4]} transparent blending={AdditiveBlending} depthWrite={false} side={2} toneMapped={false} fog={false} />
			</mesh>
			{/* The dragon. */}
			<primitive object={dragon.holder} />
			<points ref={sparkPoints} geometry={sparks.geometry} visible={false} frustumCulled={false} renderOrder={6}>
				<pointsMaterial map={dot} size={0.45} vertexColors transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
			</points>
			{/* A ball of light going off: the last of him, then the balls scattering. */}
			<sprite ref={pop} visible={false} renderOrder={6}>
				<spriteMaterial map={dot} color={[3, 2.5, 1.2]} transparent opacity={0} blending={AdditiveBlending} depthWrite={false} toneMapped={false} fog={false} />
			</sprite>
		</group>
	);
}
const stoneGrey = new Color("#6d6a66");
