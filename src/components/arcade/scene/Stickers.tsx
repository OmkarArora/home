"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";

import { snaps } from "@/content/snaps";

import { pixel } from "../pixelFont";
import { lime } from "./marquee";
import { cyan } from "./Props";
import { isTap } from "./views";

/**
 * Stickers slapped on the cabinet's sides and back, like a real arcade's:
 * easter eggs for anyone who walks round it. Each is a picture or a word in
 * a white die-cut border, a little crooked; clicking one opens what it's of.
 */

type Sticker = {
	/** A picture to cut out, or words to print. */
	art: { src: string } | { text: string[]; ink: string; paper: string };
	href?: string;
	label: string;
	/** Which face of the cabinet: left side, right side, or back. */
	on: "left" | "right" | "back";
	/** Where on that face: height, and how far along it (towards the front for the sides, across for the back). */
	at: [number, number];
	size: number;
	tilt: number;
};

const stickers: Sticker[] = [
	{ art: { src: snaps.goku.src }, href: snaps.goku.href, label: "Kid Goku, drawn by Omkar", on: "left", at: [1.25, -0.12], size: 0.17, tilt: 0.12 },
	{ art: { text: ["GAME", "NIGHT"], ink: lime, paper: "#111114" }, href: "https://gamenight.omkararora.com", label: "Game Night", on: "left", at: [0.62, 0.02], size: 0.15, tilt: -0.08 },
	{ art: { text: ["PRESS", "START"], ink: "#111114", paper: lime }, label: "Press start", on: "left", at: [0.95, -0.25], size: 0.12, tilt: 0.2 },
	{ art: { src: snaps.asta.src }, href: snaps.asta.href, label: "Asta, painted by Omkar", on: "right", at: [1.2, -0.1], size: 0.17, tilt: -0.1 },
	{ art: { text: ["1UP"], ink: cyan, paper: "#0b1216" }, label: "1UP", on: "right", at: [0.7, 0.05], size: 0.11, tilt: 0.15 },
	{ art: { text: ["YOU", "FOUND", "THE BACK"], ink: "#111114", paper: "#f3f3ee" }, href: "https://www.instagram.com/halfcoldgamesyt", label: "You found the back", on: "back", at: [1.0, 0.0], size: 0.16, tilt: -0.06 },
];

/** The outside of each face, measured from the model: sides at x ≈ ±0.37, back at z ≈ -0.392. */
function place(s: Sticker): { position: [number, number, number]; rotation: [number, number, number] } {
	const [y, along] = s.at;
	if (s.on === "left") return { position: [-0.3775, y, along], rotation: [0, -Math.PI / 2, s.tilt] };
	if (s.on === "right") return { position: [0.3705, y, along], rotation: [0, Math.PI / 2, s.tilt] };
	return { position: [along, y, -0.396], rotation: [0, Math.PI, s.tilt] };
}

/** Draws a sticker: a white border round a picture or words, cut with rounded corners. */
async function draw(s: Sticker, family: string) {
	const size = 256;
	const canvas = Object.assign(document.createElement("canvas"), { width: size, height: size });
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	const round = (x: number, y: number, w: number, h: number, r: number) => {
		ctx.beginPath();
		ctx.roundRect(x, y, w, h, r);
	};
	ctx.clearRect(0, 0, size, size);
	ctx.fillStyle = "#fbfbf6";
	round(4, 4, size - 8, size - 8, 28);
	ctx.fill();
	const inset = 18;
	ctx.save();
	round(inset, inset, size - inset * 2, size - inset * 2, 16);
	ctx.clip();
	if ("src" in s.art) {
		const image = new Image();
		image.src = s.art.src;
		await image.decode().catch(() => {});
		// Cover the square, cropped from the middle.
		const scale = Math.max((size - inset * 2) / image.width, (size - inset * 2) / image.height);
		const w = image.width * scale;
		const h = image.height * scale;
		ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
	} else {
		const { text, ink, paper } = s.art;
		ctx.fillStyle = paper;
		ctx.fillRect(0, 0, size, size);
		await document.fonts.load(`32px ${family}`).catch(() => {});
		ctx.fillStyle = ink;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const px = text.length > 2 ? 26 : 36;
		ctx.font = `${px}px ${family}`;
		text.forEach((line, i) => ctx.fillText(line, size / 2, size / 2 + (i - (text.length - 1) / 2) * px * 1.5));
	}
	ctx.restore();
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = 4;
	return texture;
}

function StickerMesh({ sticker, onHover }: { sticker: Sticker; onHover: (on: boolean) => void }) {
	const [texture, setTexture] = useState<CanvasTexture | null>(null);
	useEffect(() => {
		let live = true;
		draw(sticker, pixel.style.fontFamily).then((t) => live && setTexture(t));
		return () => {
			live = false;
		};
	}, [sticker]);
	if (!texture) return null;
	const { position, rotation } = place(sticker);
	return (
		<mesh
			position={position}
			rotation={rotation}
			name={`sticker: ${sticker.label}`}
			onClick={(event: ThreeEvent<MouseEvent>) => {
				if (!sticker.href || !isTap(event)) return;
				event.stopPropagation();
				window.open(sticker.href, "_blank", "noopener,noreferrer");
			}}
			onPointerOver={() => sticker.href && onHover(true)}
			onPointerOut={() => onHover(false)}
		>
			<planeGeometry args={[sticker.size, sticker.size]} />
			<meshStandardMaterial map={texture} transparent roughness={0.55} polygonOffset polygonOffsetFactor={-2} />
		</mesh>
	);
}

export function Stickers() {
	const [hover, setHover] = useState(false);
	useEffect(() => {
		if (!hover) return;
		document.body.style.cursor = "pointer";
		return () => {
			document.body.style.cursor = "";
		};
	}, [hover]);
	return (
		<group>
			{stickers.map((s) => (
				<StickerMesh key={s.label} sticker={s} onHover={setHover} />
			))}
		</group>
	);
}
