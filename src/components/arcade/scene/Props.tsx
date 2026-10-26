"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CanvasTexture,
	type Group,
	type Mesh,
	type MeshBasicMaterial,
	type MeshStandardMaterial,
	type PointLight,
	type Points,
	SRGBColorSpace,
	Vector3,
} from "three";

import { pixel } from "../pixelFont";
import { lime } from "./marquee";

/**
 * The things in the room that give off light, as in Jesse Zhou's ramen stall:
 * a lime glow under the cabinet, a hologram coin spinning over it, string
 * lights across the wall, a cyan neon heart, and a chalkboard easel saying
 * what to do. Only the string lights (in the room) cast real light; the rest
 * glow by being brighter than white, or paint their spill.
 */

export const cyan = "#4fe3ff";
const still = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A lime strip under the kick plate, and the soft pool it spills on the floor. The pool is painted
 * (a faded ellipse), not a light: a real light this near a shiny floor shows as one hard hotspot.
 */
export function Underglow() {
	const pool = useMemo(
		() =>
			canvasTexture(256, 256, (ctx) => {
				const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
				g.addColorStop(0, "rgb(198 240 58 / 0.32)");
				g.addColorStop(0.45, "rgb(198 240 58 / 0.12)");
				g.addColorStop(1, "rgb(198 240 58 / 0)");
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
				<meshBasicMaterial color={[2.4, 3, 0.9]} toneMapped={false} />
			</mesh>
			<mesh position={[0, 0.003, 0.62]} rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[1.3, 0.7]} />
				<meshBasicMaterial map={pool} transparent blending={AdditiveBlending} depthWrite={false} />
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
 * The coin, as pixels: an 8-bit coin taller than it is wide, with a slot down
 * the middle (our own drawing). # is the rim, + the face, . is empty.
 */
const coinArt = [
	"....######....",
	"...#++++++#...",
	"..#++++++++#..",
	".#++++++++++#.",
	".#++++..++++#.",
	"#+++++..+++++#",
	"#+++++..+++++#",
	"#+++++..+++++#",
	"#+++++..+++++#",
	"#+++++..+++++#",
	"#+++++..+++++#",
	".#++++..++++#.",
	".#++++++++++#.",
	"..#++++++++#..",
	"...#++++++#...",
	"....######....",
];

/** The coin as a cloud of points: every pixel on the front and the back, and the rim through its depth, so it never vanishes edge-on. */
function coinCloud() {
	const pixelSize = 0.0125;
	const depth = 0.018;
	const rows = coinArt.length;
	const cols = coinArt[0].length;
	const points: number[] = [];
	const colours: number[] = [];
	// Over 1, so the glow picks the coin up; the rim brightest, a few lime glints.
	const rim = [0.5, 1.7, 2];
	const face = [0.3, 1.1, 1.3];
	coinArt.forEach((row, r) =>
		[...row].forEach((cell, c) => {
			if (cell === ".") return;
			const x = (c - (cols - 1) / 2) * pixelSize;
			const y = ((rows - 1) / 2 - r) * pixelSize;
			const layers = cell === "#" ? [-depth, -depth / 2, 0, depth / 2, depth] : [-depth, depth];
			for (const z of layers) {
				points.push(x, y, z);
				const glint = Math.random() < 0.06;
				colours.push(...(glint ? [1.4, 2, 0.5] : cell === "#" ? rim : face));
			}
		}),
	);
	const g = new BufferGeometry();
	g.setAttribute("position", new BufferAttribute(new Float32Array(points), 3));
	g.setAttribute("color", new BufferAttribute(new Float32Array(colours), 3));
	return g;
}

/**
 * A hologram over the cabinet: a pixel coin turning slowly in a cyan
 * projector beam, specks rising through it. Insert a coin and it hops and
 * spins. Now and then the signal drops out for a blink.
 */
export function Hologram({ bump = false }: { bump?: boolean }) {
	const coin = useRef<Group>(null);
	const specks = useRef<Points>(null);
	const beam = useRef<Mesh>(null);
	const bumped = useRef(-10);
	const clock = useRef(0);
	const spin = useRef(0);
	const cloud = useMemo(coinCloud, []);

	useEffect(() => {
		if (bump) bumped.current = clock.current;
	}, [bump]);

	// Specks rising through the beam, wrapping back to the bottom.
	const geometry = useMemo(() => {
		const g = new BufferGeometry();
		const n = 70;
		const p = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const r = Math.random() * 0.12;
			p.set([Math.cos(a) * r, Math.random() * 0.42, Math.sin(a) * r], i * 3);
		}
		g.setAttribute("position", new BufferAttribute(p, 3));
		return g;
	}, []);

	useFrame(({ clock: c }, dt) => {
		clock.current = c.elapsedTime;
		if (still()) return;
		const t = c.elapsedTime;
		if (coin.current) {
			// A slow turn; after a coin, a quick hop and a fast spin that settles back.
			const since = (t - bumped.current) / 0.6;
			const hop = since < 1 ? Math.sin(since * Math.PI) : 0;
			spin.current += dt * (0.6 + (since < 1 ? 14 * (1 - since) : 0));
			coin.current.rotation.y = spin.current;
			coin.current.position.y = 0.25 + Math.sin(t * 1.4) * 0.012 + hop * 0.07;
			// A bad signal: every 5.3 s it drops out twice, quickly (out of step with the wall sign's stutter).
			const at = t % 5.3;
			coin.current.visible = !((at > 3.1 && at < 3.16) || (at > 3.24 && at < 3.3));
		}
		if (specks.current) {
			const p = specks.current.geometry.attributes.position as BufferAttribute;
			for (let i = 0; i < p.count; i++) p.setY(i, (p.getY(i) + dt * 0.08) % 0.42);
			p.needsUpdate = true;
		}
		if (beam.current) (beam.current.material as MeshBasicMaterial).opacity = 0.07 + Math.sin(t * 2.2) * 0.015;
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
				<meshBasicMaterial color={[0.5, 1.5, 1.7]} toneMapped={false} />
			</mesh>
			<mesh ref={beam} position={[0, 0.22, 0]}>
				<cylinderGeometry args={[0.15, 0.05, 0.4, 24, 1, true]} />
				<meshBasicMaterial color={cyan} transparent opacity={0.07} blending={AdditiveBlending} depthWrite={false} side={2} toneMapped={false} />
			</mesh>
			<points ref={specks} geometry={geometry} position={[0, 0.03, 0]}>
				<pointsMaterial color={cyan} size={0.008} transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
			</points>
			<group ref={coin} position={[0, 0.25, 0]}>
				<points geometry={cloud}>
					<pointsMaterial vertexColors size={0.011} transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
				</points>
			</group>
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

/** A cyan neon heart on the wall: a 1UP, drawn in pixels. */
export function NeonHeart() {
	const [texture, setTexture] = useState<CanvasTexture | null>(null);
	useEffect(() => {
		const heart = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
		setTexture(
			canvasTexture(256, 256, (ctx) => {
				ctx.fillStyle = "#000";
				ctx.fillRect(0, 0, 256, 256);
				const cell = 30;
				const x0 = (256 - 7 * cell) / 2;
				const y0 = (256 - 6 * cell) / 2;
				for (const [blur, colour, width] of [
					[30, cyan, 6],
					[10, cyan, 4],
					[0, "#d8faff", 2],
				] as const) {
					ctx.shadowColor = colour;
					ctx.shadowBlur = blur;
					ctx.strokeStyle = colour;
					ctx.lineWidth = width;
					heart.forEach((row, y) => [...row].forEach((on, x) => on === "1" && ctx.strokeRect(x0 + x * cell + 4, y0 + y * cell + 4, cell - 8, cell - 8)));
				}
			}),
		);
	}, []);
	if (!texture) return null;
	return (
		<group position={[2.05, 1.5, -1.37]}>
			<mesh>
				<planeGeometry args={[0.5, 0.5]} />
				<meshBasicMaterial map={texture} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} color={[2, 2, 2]} />
			</mesh>
		</group>
	);
}

/** A chalkboard easel by the cabinet: what you can do here. */
export function Easel() {
	const [board, setBoard] = useState<CanvasTexture | null>(null);
	useEffect(() => {
		const family = pixel.style.fontFamily;
		document.fonts.load(`24px ${family}`).finally(() =>
			setBoard(
				canvasTexture(256, 340, (ctx) => {
					ctx.fillStyle = "#16201a";
					ctx.fillRect(0, 0, 256, 340);
					ctx.fillStyle = "rgb(255 255 255 / 0.04)";
					for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * 256, Math.random() * 340, 40, 2);
					ctx.fillStyle = "#ecebe2";
					ctx.textAlign = "center";
					ctx.font = `20px ${family}`;
					["DRAG", "TO LOOK", "AROUND"].forEach((line, i) => ctx.fillText(line, 128, 70 + i * 34));
					ctx.font = `30px ${family}`;
					ctx.fillText("◀ ▶", 128, 200);
					ctx.fillStyle = lime;
					ctx.font = `14px ${family}`;
					["PRESS THE", "BUTTONS"].forEach((line, i) => ctx.fillText(line, 128, 260 + i * 26));
				}),
			),
		);
	}, []);
	return (
		<group position={[0.78, 0, 0.42]} rotation={[0, -0.45, 0]}>
			{/* Two legs, leaning in. */}
			{[-0.15, 0.15].map((x) => (
				<mesh key={x} position={[x, 0.36, 0]} rotation={[0.12, 0, 0]}>
					<boxGeometry args={[0.025, 0.74, 0.02]} />
					<meshStandardMaterial color="#6b4a2b" roughness={0.8} />
				</mesh>
			))}
			<mesh position={[0, 0.44, 0.03]} rotation={[0.12, 0, 0]}>
				<boxGeometry args={[0.36, 0.47, 0.015]} />
				<meshStandardMaterial color="#6b4a2b" roughness={0.8} />
			</mesh>
			{board && (
				<mesh position={[0, 0.44, 0.039]} rotation={[0.12, 0, 0]}>
					<planeGeometry args={[0.32, 0.425]} />
					<meshStandardMaterial map={board} roughness={0.9} />
				</mesh>
			)}
		</group>
	);
}
