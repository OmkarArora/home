"use client";

import { motion } from "motion/react";
import Image from "next/image";

import { mono } from "../ui";
import { afk, extras } from "@/content/afk";

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
				<motion.figure
					key={picture.src}
					initial={false}
					style={{ rotate: tilt[i % tilt.length] }}
					whileHover={{ rotate: 0, scale: 1.04, zIndex: 2 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
					className="relative mb-4 break-inside-avoid border border-[var(--line)] bg-[#fafaf5] p-2 pb-1 shadow-[0_8px_20px_rgb(0_0_0/0.15)]"
				>
					<div className={`relative aspect-[4/5] overflow-hidden ${picture.contain ? "bg-white" : ""}`}>
						<Image src={picture.src} alt={picture.alt} fill sizes="240px" className={picture.contain ? "object-contain p-1" : "object-cover"} />
					</div>
					<figcaption className={`${mono} py-2 text-center text-xs text-[#0c0c0d]`}>{picture.caption}</figcaption>
				</motion.figure>
			))}
		</div>
	);
}
