"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	Color,
	type Group,
	type InstancedMesh,
	type Mesh,
	Object3D,
	type MeshBasicMaterial,
	type MeshStandardMaterial,
	type PointLight,
	type Points,
	SRGBColorSpace,
	Quaternion,
	ShaderMaterial,
	Vector3,
} from "three";

import { pixel } from "../pixelFont";
import { lime } from "./marquee";
import { useView } from "./CameraRig";
import { usePalette } from "./palette";
import { layout } from "./layout";
import { facingWide, isTap, neonPair } from "./views";

/**
 * The things in the room that give off light, as in Jesse Zhou's ramen stall,
 * in the scene's palette (`palette.ts`): a glow under the cabinet, a hologram coin spinning over it, string
 * lights across the wall, a neon heart, and a chalkboard easel saying
 * what to do. Only the string lights (in the room) cast real light; the rest
 * glow by being brighter than white, or paint their spill.
 */

export const cyan = "#4fe3ff";
const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A strip of light under the kick plate, and the soft pool it spills on the floor. The pool is painted
 * (a faded ellipse), not a light: a real light this near a shiny floor shows as one hard hotspot.
 */
export function Underglow() {
	const { underglow } = usePalette();
	const pool = useMemo(
		() =>
			canvasTexture(256, 256, (ctx) => {
				const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
				g.addColorStop(0, "rgb(255 255 255 / 0.32)");
				g.addColorStop(0.45, "rgb(255 255 255 / 0.12)");
				g.addColorStop(1, "rgb(255 255 255 / 0)");
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, 256, 256);
			}),
		[],
	);
	return (
		<group>
			<mesh position={[0, 0.012, 0.33]}>
				<boxGeometry args={[0.6, 0.01, 0.012]} />
				{/* Over 1, so the glow picks it up. */}
				<meshBasicMaterial color={new Color(underglow).multiplyScalar(2.6)} toneMapped={false} />
			</mesh>
			<mesh position={[0, 0.003, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[1.3, 0.7]} />
				<meshBasicMaterial map={pool} color={underglow} transparent blending={AdditiveBlending} depthWrite={false} />
			</mesh>
		</group>
	);
}

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
	const canvas = Object.assign(document.createElement("canvas"), { width, height });
	const ctx = canvas.getContext("2d");
	if (ctx) draw(ctx);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}

/**
 * The hologram's points: each a soft round glow, sized by distance, twinkling on its own phase,
 * and brighter than white so the bloom haloes every one. A scan line sweeps up through them,
 * and now and then a band slips sideways for a frame.
 */
const hologramShader = {
	vertexShader: /* glsl */ `
		uniform float uTime;
		uniform float uSize;
		uniform float uScan;
		uniform float uGlitch;
		uniform float uGlitchY;
		attribute float aPhase;
		attribute float aSize;
		varying float vLight;
		void main() {
			vec3 p = position;
			p.x += step(abs(p.y - uGlitchY), 0.014) * uGlitch * 0.035;
			vec4 view = modelViewMatrix * vec4(p, 1.0);
			gl_Position = projectionMatrix * view;
			float twinkle = 0.6 + 0.4 * sin(uTime * 2.2 + aPhase * 6.2832);
			float scan = smoothstep(0.035, 0.0, abs(p.y - uScan));
			vLight = twinkle + scan * 0.9;
			gl_PointSize = uSize * aSize / -view.z;
		}
	`,
	fragmentShader: /* glsl */ `
		uniform vec3 uColor;
		uniform float uOpacity;
		varying float vLight;
		void main() {
			float glow = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5));
			gl_FragColor = vec4(uColor * vLight * 2.6, glow * glow * uOpacity);
		}
	`,
};

function hologramMaterial(colour: string, size: number) {
	return new ShaderMaterial({
		...hologramShader,
		uniforms: {
			uTime: { value: 0 },
			uSize: { value: size * Math.min(window.devicePixelRatio, 2) },
			uScan: { value: 0 },
			uGlitch: { value: 0 },
			uGlitchY: { value: 0 },
			uColor: { value: new Color(colour) },
			uOpacity: { value: 1 },
		},
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending,
	});
}

/**
 * The coin as a cloud: an oval coin taller than it is wide, with a raised rim on each face and a
 * slot down the middle (in the spirit of an 8-bit coin, our own shape). Points are densest along
 * the rim and the slot, so the form reads; a sparse fill gives the faces body.
 */
function coinCloud() {
	const [a, b, t] = [0.1, 0.13, 0.026];
	const points: number[] = [];
	const phases: number[] = [];
	const sizes: number[] = [];
	const add = (x: number, y: number, z: number, size: number) => {
		points.push(x, y, z);
		phases.push(Math.random());
		sizes.push(size * (0.8 + Math.random() * 0.4));
	};
	const jitter = () => (Math.random() - 0.5) * 0.003;
	// The edge, all through the coin's thickness.
	for (let i = 0; i < 800; i++) {
		const angle = Math.random() * Math.PI * 2;
		add(Math.cos(angle) * a + jitter(), Math.sin(angle) * b + jitter(), (Math.random() - 0.5) * t, 1.1);
	}
	for (const face of [-1, 1]) {
		// The raised ring on each face.
		for (let i = 0; i < 320; i++) {
			const angle = Math.random() * Math.PI * 2;
			add(Math.cos(angle) * a * 0.8 + jitter(), Math.sin(angle) * b * 0.8 + jitter(), face * (t / 2 + 0.003), 1);
		}
		// The slot: a tall thin oval, standing proud of the face.
		for (let i = 0; i < 200; i++) {
			const angle = Math.random() * Math.PI * 2;
			add(Math.cos(angle) * 0.016 + jitter(), Math.sin(angle) * 0.072 + jitter(), face * (t / 2 + 0.005), 1.05);
		}
		// A sparse fill, for body.
		for (let i = 0; i < 300; i++) {
			const [x, y] = [(Math.random() * 2 - 1) * a, (Math.random() * 2 - 1) * b];
			if ((x / a) ** 2 + (y / b) ** 2 > 0.62) continue;
			add(x, y, face * (t / 2), 0.7);
		}
	}
	const g = new BufferGeometry();
	g.setAttribute("position", new BufferAttribute(new Float32Array(points), 3));
	g.setAttribute("aPhase", new BufferAttribute(new Float32Array(phases), 1));
	g.setAttribute("aSize", new BufferAttribute(new Float32Array(sizes), 1));
	return g;
}

/** A beam that fades out upwards: light at the projector, nothing at the top. */
function beamTexture() {
	// An alpha map reads brightness, not alpha: black is clear.
	return canvasTexture(4, 128, (ctx) => {
		const g = ctx.createLinearGradient(0, 128, 0, 0);
		g.addColorStop(0, "#5a5a5a");
		g.addColorStop(0.3, "#1c1c1c");
		g.addColorStop(1, "#000");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 4, 128);
	});
}

/**
 * A hologram over the cabinet: a coin made of glowing points turning slowly in a soft projector
 * beam, specks rising through it. Click it to grab a coin (a credit); any coin in makes it hop and spin.
 */
export function Hologram({ bump = false }: { bump?: boolean }) {
	const { hologram: colour } = usePalette();
	const { coin: grab, say } = useView();
	const coin = useRef<Group>(null);
	const specks = useRef<Points>(null);
	const bumped = useRef(-10);
	const clock = useRef(0);
	const spin = useRef(0);
	const glitch = useRef({ next: 3, until: 0 });
	const cloud = useMemo(coinCloud, []);
	const coinMaterial = useMemo(() => hologramMaterial(colour, 12), [colour]);
	const speckMaterial = useMemo(() => hologramMaterial(colour, 7), [colour]);
	const beam = useMemo(beamTexture, []);

	useEffect(() => {
		if (bump) bumped.current = clock.current;
	}, [bump]);

	// Specks rising through the beam, wrapping back to the bottom.
	const geometry = useMemo(() => {
		const g = new BufferGeometry();
		const n = 60;
		const p = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const angle = Math.random() * Math.PI * 2;
			const r = Math.random() * 0.18;
			p.set([Math.cos(angle) * r, Math.random() * 0.42, Math.sin(angle) * r], i * 3);
		}
		g.setAttribute("position", new BufferAttribute(p, 3));
		g.setAttribute("aPhase", new BufferAttribute(Float32Array.from({ length: n }, Math.random), 1));
		g.setAttribute("aSize", new BufferAttribute(new Float32Array(n).fill(1), 1));
		return g;
	}, []);

	useFrame((_, dt) => {
		// Its own clock, which only goes forward: three's restarts from 0 whenever the scene stops
		// drawing (a hidden tab), and the last coin's time would then be in the future, read as a
		// spin that never settles.
		const t = (clock.current += Math.min(dt, 0.1));
		for (const material of [coinMaterial, speckMaterial]) material.uniforms.uTime.value = t;
		if (still()) return;
		const u = coinMaterial.uniforms;
		// The scan line climbs through the coin every 3 s.
		u.uScan.value = ((t % 3) / 3) * 0.36 - 0.18;
		// Every few seconds a band slips sideways for a moment.
		const g = glitch.current;
		if (t > g.next) {
			g.until = t + 0.08;
			g.next = t + 4 + Math.random() * 4;
			u.uGlitchY.value = (Math.random() - 0.5) * 0.24;
		}
		u.uGlitch.value = t < g.until ? 1 : 0;
		if (coin.current) {
			// A slow turn (about 12 s round); after a coin, a quick hop and a fast spin that settles back.
			const since = (t - bumped.current) / 0.6;
			const hop = since < 1 ? Math.sin(since * Math.PI) : 0;
			spin.current += dt * (0.52 + (since < 1 ? 14 * (1 - since) : 0));
			coin.current.rotation.y = spin.current;
			coin.current.position.y = 0.25 + Math.sin(t * 1.4) * 0.012 + hop * 0.07;
		}
		if (specks.current) {
			const p = specks.current.geometry.attributes.position as BufferAttribute;
			for (let i = 0; i < p.count; i++) p.setY(i, (p.getY(i) + dt * 0.08) % 0.42);
			p.needsUpdate = true;
		}
	});

	return (
		<group position={[0, 1.8, -0.08]}>
			{/* The projector, on the cabinet's roof. */}
			<mesh position={[0, 0.012, 0]}>
				<cylinderGeometry args={[0.07, 0.08, 0.024, 24]} />
				<meshStandardMaterial color="#1a1a1f" metalness={0.6} roughness={0.3} />
			</mesh>
			<mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<circleGeometry args={[0.05, 24]} />
				<meshBasicMaterial color={new Color(colour).multiplyScalar(1.6)} toneMapped={false} />
			</mesh>
			<mesh position={[0, 0.22, 0]}>
				<cylinderGeometry args={[0.27, 0.06, 0.4, 32, 1, true]} />
				<meshBasicMaterial color={colour} alphaMap={beam} transparent blending={AdditiveBlending} depthWrite={false} side={2} toneMapped={false} />
			</mesh>
			<points ref={specks} geometry={geometry} material={speckMaterial} position={[0, 0.03, 0]} />
			<group ref={coin} position={[0, 0.25, 0]}>
				<points geometry={cloud} material={coinMaterial} />
			</group>
			{/* Grab the coin: an invisible handle round it. It hops and spins, and you have a credit. */}
			<mesh
				position={[0, 0.25, 0]}
				onClick={(event) => {
					if (!isTap(event)) return;
					event.stopPropagation();
					grab();
				}}
				onPointerOver={(event) => {
					event.stopPropagation();
					document.body.style.cursor = "pointer";
					say("Grab a coin");
				}}
				onPointerOut={() => {
					document.body.style.cursor = "";
					say(null);
				}}
			>
				<cylinderGeometry args={[0.14, 0.14, 0.3, 12]} />
				<meshBasicMaterial transparent opacity={0} depthWrite={false} />
			</mesh>
		</group>
	);
}

/** String lights sagging across the wall: lime and warm bulbs that twinkle a little. */
export function StringLights() {
	const bulbs = useMemo(() => {
		const from = new Vector3(-1.9, 2.42, -1.32);
		const to = new Vector3(2.1, 2.38, -1.32);
		return Array.from({ length: 18 }, (_, i) => {
			const t = i / 17;
			const p = from.clone().lerp(to, t);
			p.y -= Math.sin(t * Math.PI) * 0.18;
			return { p, warm: i % 2 === 1, phase: Math.random() * 6 };
		});
	}, []);
	const mats = useRef<MeshStandardMaterial[]>([]);
	const lights = useRef<PointLight[]>([]);

	useFrame(({ clock }) => {
		if (still()) return;
		const t = clock.elapsedTime;
		mats.current.forEach((m, i) => (m.emissiveIntensity = 2.2 + Math.sin(t * 1.7 + bulbs[i].phase) * 0.6));
	});

	// The wire, as a thin line through the bulbs.
	const wire = useMemo(() => new BufferGeometry().setFromPoints(bulbs.map((b) => b.p.clone().add(new Vector3(0, 0.03, 0)))), [bulbs]);

	return (
		<group>
			<line>
				<primitive object={wire} attach="geometry" />
				<lineBasicMaterial color="#2a2a2e" />
			</line>
			{bulbs.map((b, i) => (
				<mesh key={i} position={b.p}>
					<sphereGeometry args={[0.022, 12, 12]} />
					<meshStandardMaterial
						ref={(m) => void (m && (mats.current[i] = m))}
						color="#000"
						emissive={b.warm ? "#ffcf87" : lime}
						emissiveIntensity={2.2}
						toneMapped={false}
					/>
				</mesh>
			))}
			{[-1, 0.2, 1.4].map((x, i) => (
				<pointLight key={x} ref={(l) => void (l && (lights.current[i] = l))} position={[x, 2.1, -1.1]} color={i === 1 ? "#ffcf87" : lime} intensity={0.5} distance={2.6} decay={2} />
			))}
		</group>
	);
}

/**
 * A neon sign in 3D, from a pixel sprite: every lit pixel a heavy block (one instanced mesh for the
 * lot), shaded on its sides and faintly lit from within, with a glowing face on the front brighter
 * than white so the bloom haloes it. It stutters now and then like a tired neon, on its own beat.
 */
export function NeonSign({
	sprite,
	colour,
	width,
	position,
	stutter,
}: {
	sprite: string[];
	colour: string;
	/** How wide the sprite is, in metres. */
	width: number;
	position: [number, number, number];
	/** When it cuts out: given the time in s, true while dark. */
	stutter: (t: number) => boolean;
}) {
	const [cols, rows] = [sprite[0].length, sprite.length];
	const cell = width / cols;
	const [block, depth] = [cell * 0.88, cell * 0.9];
	const cells = useMemo(
		() =>
			sprite.flatMap((row, y) =>
				[...row].flatMap((on, x) => (on === "1" ? [[(x - (cols - 1) / 2) * cell, ((rows - 1) / 2 - y) * cell] as const] : [])),
			),
		[sprite, cell, cols, rows],
	);
	const blocks = useRef<InstancedMesh>(null);
	const faces = useRef<InstancedMesh>(null);
	useLayoutEffect(() => {
		const o = new Object3D();
		cells.forEach(([x, y], i) => {
			o.position.set(x, y, 0);
			o.scale.set(block, block, depth);
			o.updateMatrix();
			blocks.current?.setMatrixAt(i, o.matrix);
			// The face sits just proud of the block's front, a little inset from its edges.
			o.position.set(x, y, depth / 2 + 0.0006);
			o.scale.set(block * 0.9, block * 0.9, 1);
			o.updateMatrix();
			faces.current?.setMatrixAt(i, o.matrix);
		});
		for (const m of [blocks.current, faces.current]) if (m) m.instanceMatrix.needsUpdate = true;
	}, [cells, block, depth]);
	const bright = useMemo(() => new Color(colour).multiplyScalar(2.6), [colour]);
	const body = useRef<MeshStandardMaterial>(null);
	const face = useRef<MeshBasicMaterial>(null);
	useFrame(({ clock }) => {
		const level = !still() && stutter(clock.elapsedTime) ? 0.15 : 1;
		face.current?.color.copy(bright).multiplyScalar(level);
		if (body.current) body.current.emissiveIntensity = 0.55 * level;
	});
	return (
		<group position={position} rotation={[0, facingWide(position[0], position[2]), 0]}>
			<instancedMesh ref={blocks} args={[undefined, undefined, cells.length]} castShadow>
				<boxGeometry />
				<meshStandardMaterial ref={body} color={colour} emissive={colour} emissiveIntensity={0.55} roughness={0.45} metalness={0.1} />
			</instancedMesh>
			<instancedMesh ref={faces} args={[undefined, undefined, cells.length]}>
				<planeGeometry />
				<meshBasicMaterial ref={face} color={bright} toneMapped={false} />
			</instancedMesh>
		</group>
	);
}

const alienSprite = ["00010001000", "00001010000", "00111111100", "01111111110", "11011011011", "11111111111", "01101010110", "11000000011"];
const heartSprite = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];

/** The neon pair behind the cabinet, either side of the hologram: an alien on the left, a heart (a 1UP) on the right. */
export function NeonPair() {
	const { sign, heart } = usePalette();
	return (
		<>
			<NeonSign
				sprite={alienSprite}
				colour={sign[0]}
				width={neonPair.size}
				position={[-neonPair.x, neonPair.y, neonPair.z]}
				// Two quick cuts every 6.4 s.
				stutter={(t) => {
					const f = (t % 6.4) / 6.4;
					return (f > 0.586 && f < 0.598) || (f > 0.612 && f < 0.624);
				}}
			/>
			<NeonSign
				sprite={heartSprite}
				colour={heart[0]}
				width={neonPair.size * 0.66}
				position={[neonPair.x, neonPair.y, neonPair.z]}
				// Its own beat: a double cut, and a single one later.
				stutter={(t) => {
					const f = ((t + 2.3) % 5.1) / 5.1;
					return (f > 0.41 && f < 0.425) || (f > 0.44 && f < 0.452) || (f > 0.83 && f < 0.838);
				}}
			/>
		</>
	);
}

/**
 * A chalk drawing for the sandwich board (our own): a mouse with arrows either side, and
 * CLICK & DRAG under it, in a slightly wobbly hand on a dusty black board.
 */
function drawChalkboard(family: string) {
	return canvasTexture(320, 420, (ctx) => {
		ctx.fillStyle = "#121314";
		ctx.fillRect(0, 0, 320, 420);
		// Old chalk, rubbed out.
		for (let i = 0; i < 70; i++) {
			ctx.fillStyle = `rgb(255 255 255 / ${0.015 + Math.random() * 0.03})`;
			ctx.fillRect(Math.random() * 320, Math.random() * 420, 20 + Math.random() * 60, 2 + Math.random() * 3);
		}
		ctx.strokeStyle = ctx.fillStyle = "#e9e7df";
		ctx.lineCap = ctx.lineJoin = "round";
		const wobble = () => (Math.random() - 0.5) * 2;
		// The mouse: a rounded body, the buttons' line and parting, and its cable curling up.
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.roundRect(126 + wobble(), 88, 68, 110, 34);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(128, 132);
		ctx.lineTo(192, 132 + wobble());
		ctx.moveTo(160, 90);
		ctx.lineTo(160 + wobble(), 132);
		ctx.stroke();
		ctx.fillRect(132, 98, 24, 30);
		ctx.beginPath();
		ctx.moveTo(160, 88);
		ctx.bezierCurveTo(160, 60, 140, 66, 150, 44);
		ctx.bezierCurveTo(156, 30, 170, 34, 166, 22);
		ctx.stroke();
		// Arrows either side.
		for (const side of [-1, 1]) {
			const x = 160 + side * 100;
			ctx.beginPath();
			ctx.moveTo(x - side * 30, 140);
			ctx.lineTo(x + side * 6, 140 + wobble());
			ctx.lineTo(x + side * 6, 128);
			ctx.lineTo(x + side * 26, 142);
			ctx.lineTo(x + side * 6, 156);
			ctx.lineTo(x + side * 6, 146);
			ctx.lineTo(x - side * 30, 146 + wobble());
			ctx.closePath();
			ctx.fill();
		}
		// The words, a little crooked.
		ctx.textAlign = "center";
		ctx.font = `30px ${family}`;
		ctx.save();
		ctx.translate(160, 268);
		ctx.rotate(-0.03);
		ctx.fillText("CLICK &", 0, 0);
		ctx.rotate(0.06);
		ctx.fillText("DRAG", 0, 52);
		ctx.restore();
		ctx.font = `13px ${family}`;
		ctx.fillStyle = "rgb(233 231 223 / 0.7)";
		ctx.fillText("GRAB THE COIN", 160, 382);
	});
}

/** A wooden bar from one point to another, square in section. */
function Plank({ from, to, size, colour }: { from: Vector3; to: Vector3; size: [number, number]; colour: string }) {
	const { position, quaternion, length } = useMemo(() => {
		const along = to.clone().sub(from);
		return {
			position: from.clone().add(to).multiplyScalar(0.5),
			quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), along.clone().normalize()),
			length: along.length(),
		};
	}, [from, to]);
	return (
		<mesh position={position} quaternion={quaternion} castShadow>
			<boxGeometry args={[size[0], length, size[1]]} />
			<meshStandardMaterial color={colour} roughness={0.75} />
		</mesh>
	);
}

/**
 * A sandwich board by the cabinet, after the one outside Jesse Zhou's ramen stall: two framed
 * chalkboards hinged at the top, standing as an A on the floor, saying how to look around.
 */
export function Sandwich() {
	const [board, setBoard] = useState<CanvasTexture | null>(null);
	useEffect(() => {
		const family = pixel.style.fontFamily;
		document.fonts.load(`30px ${family}`).finally(() => setBoard(drawChalkboard(family)));
	}, []);
	const [w, h, splay] = [0.36, 0.62, 0.2];
	const wood = "#c8742f";
	const edge = "#3f8a3a";
	return (
		<group position={layout.sandwich.at} rotation={[0, layout.sandwich.turn, 0]}>
			{[1, -1].map((face) => (
				// Each half leans back from the hinge at the top, feet apart on the floor.
				<group key={face} position={[0, h, 0]} rotation={[-face * splay, face === 1 ? 0 : Math.PI, 0]}>
					<group position={[0, -h / 2, 0.012]}>
						{/* The frame: two legs past the board's foot, rails top and bottom, a painted edge. */}
						{[-1, 1].map((side) => (
							<Plank
								key={side}
								from={new Vector3((side * (w - 0.03)) / 2, -h / 2 - 0.03, 0)}
								to={new Vector3((side * (w - 0.03)) / 2, h / 2, 0)}
								size={[0.03, 0.022]}
								colour={wood}
							/>
						))}
						{[h / 2 - 0.015, -h / 2 + 0.07].map((y) => (
							<Plank key={y} from={new Vector3(-w / 2, y, 0)} to={new Vector3(w / 2, y, 0)} size={[0.03, 0.022]} colour={wood} />
						))}
						<mesh position={[0, 0.02, -0.012]}>
							<boxGeometry args={[w + 0.004, h - 0.06, 0.004]} />
							<meshStandardMaterial color={edge} roughness={0.8} />
						</mesh>
						{board && (
							<mesh position={[0, 0.025, 0.004]}>
								<planeGeometry args={[w - 0.05, h - 0.13]} />
								<meshStandardMaterial map={board} roughness={0.95} />
							</mesh>
						)}
					</group>
				</group>
			))}
		</group>
	);
}
