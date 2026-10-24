"use client";

import { motion } from "motion/react";
import Image from "next/image";

import { mono } from "../ui";
import { afk, extras } from "./data";

const tilt = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5];

/**
 * A loose wall: photos and art as polaroids, interests as small notes, all a
 * little crooked. Hovering one straightens and lifts it. `picturesOnly` leaves
 * the notes out, for when the interests are listed elsewhere.
 */
export function Scrapbook({ picturesOnly = false }: { picturesOnly?: boolean }) {
	const pieces = [
		...(picturesOnly ? [] : afk.map((item) => ({ kind: "note" as const, item }))),
		...afk.filter((item) => item.image).map((item) => ({ kind: "photo" as const, src: item.image!.src, alt: item.image!.alt, caption: item.label, contain: item.image!.contain })),
		...extras.map((extra) => ({ kind: "photo" as const, ...extra, contain: false })),
	];
	// Interleave notes and photos so neither clumps.
	const notes = pieces.filter((p) => p.kind === "note");
	const photos = pieces.filter((p) => p.kind === "photo");
	const wall = picturesOnly
		? photos
		: [...notes.flatMap((note, i) => (photos[i] ? [note, photos[i]] : [note])), ...photos.slice(notes.length)];

	return (
		<div className={`gap-4 ${picturesOnly ? "columns-3 md:columns-5" : "columns-2 md:columns-4"}`}>
			{wall.map((piece, i) => (
				<motion.div
					key={i}
					initial={false}
					style={{ rotate: tilt[i % tilt.length] }}
					whileHover={{ rotate: 0, scale: 1.04, zIndex: 2 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
					className="relative mb-4 break-inside-avoid"
				>
					{piece.kind === "photo" ? (
						<figure className="border border-[var(--line)] bg-[#fafaf5] p-2 pb-1 shadow-[0_8px_20px_rgb(0_0_0/0.15)]">
							<div className={`relative aspect-[4/5] overflow-hidden ${piece.contain ? "bg-white" : ""}`}>
								<Image src={piece.src} alt={piece.alt} fill sizes="300px" className={piece.contain ? "object-contain p-1" : "object-cover"} />
							</div>
							<figcaption className={`${mono} py-2 text-center text-xs text-[#0c0c0d]`}>{piece.caption}</figcaption>
						</figure>
					) : (
						<div className={`p-4 shadow-[0_8px_20px_rgb(0_0_0/0.12)] ${i % 3 === 0 ? "bg-[var(--lime)] text-[#0c0c0d]" : "border border-[var(--line)] bg-[var(--card)]"}`}>
							<p className={`${mono} text-xs uppercase tracking-widest opacity-70`}>{piece.item.note}</p>
							<p className="mt-1 text-2xl font-extrabold tracking-tight">{piece.item.label}</p>
							<p className="mt-2 text-sm leading-snug opacity-80">{piece.item.line}</p>
						</div>
					)}
				</motion.div>
			))}
		</div>
	);
}
