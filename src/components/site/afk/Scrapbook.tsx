"use client";

import { motion } from "motion/react";

import { afk, extras } from "@/content/afk";

import { Polaroid, PolaroidPhoto } from "../Polaroid";

const tilt = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5];

/**
 * A loose wall of his art and photos as polaroids, each a little crooked.
 * Hovering one straightens and lifts it.
 */
export function Scrapbook() {
	const pictures = [
		...afk.flatMap((item) => (item.image ? [{ ...item.image, caption: item.label }] : [])),
		...extras.map((extra) => ({ ...extra, contain: false })),
	];

	return (
		<div className="columns-3 gap-4 md:columns-5">
			{pictures.map((picture, i) => (
				<motion.div
					key={picture.src}
					initial={false}
					style={{ rotate: tilt[i % tilt.length] }}
					whileHover={{ rotate: 0, scale: 1.04, zIndex: 2 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
					className="relative mb-4 break-inside-avoid"
				>
					<Polaroid caption={<span className="w-full text-center">{picture.caption}</span>}>
						<PolaroidPhoto src={picture.src} alt={picture.alt} contain={picture.contain} sizes="240px" className="aspect-[4/5]" />
					</Polaroid>
				</motion.div>
			))}
		</div>
	);
}
