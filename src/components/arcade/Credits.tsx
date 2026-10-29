"use client";

import { useEffect, useRef, useState } from "react";

import { pixel } from "./pixelFont";

/**
 * Who made the Arcade's 3D models: each is from Sketchfab under CC BY 4.0,
 * which asks for the credit where the work is shown. A small button in the
 * corner of the scene opens the list (also in public/models/CREDITS.txt).
 */

const models = [
	{ what: "Arcade cabinet", by: "JewelPodd", model: "https://sketchfab.com/3d-models/arcade-cabinet-21ee4868e8f14bca979f24df1276b770", author: "https://sketchfab.com/JewelPodd" },
	{ what: "CRT TV", by: "Poring", model: "https://sketchfab.com/3d-models/sony-pvm-14l2-crt-tv-ab19c2419c2647299ce96d027b3e7f5e", author: "https://sketchfab.com/poring" },
	{ what: "Games console", by: "Vladimir_Sofyanov", model: "https://sketchfab.com/3d-models/sony-playstation-one-4afd87cc153346f8a8400a1e8517a6c9", author: "https://sketchfab.com/vladimirsoufl" },
	{ what: "Record player", by: "AleixoAlonso", model: "https://sketchfab.com/3d-models/yamaha-tt-300-record-player-3577a2a1a0c24218bd5d768beccf218e", author: "https://sketchfab.com/AleixoAlonso" },
];

const licence = "https://creativecommons.org/licenses/by/4.0/";

export function Credits({ className = "" }: { className?: string }) {
	const [open, setOpen] = useState(false);
	const button = useRef<HTMLButtonElement>(null);
	const close = useRef<HTMLButtonElement>(null);

	// Open: focus inside; Esc or × closes and hands focus back.
	useEffect(() => {
		if (!open) return;
		close.current?.focus();
		const onKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.stopPropagation();
			setOpen(false);
			button.current?.focus();
		};
		document.addEventListener("keydown", onKey, true);
		return () => document.removeEventListener("keydown", onKey, true);
	}, [open]);

	return (
		<>
			<button
				ref={button}
				type="button"
				onClick={() => setOpen(true)}
				className={`${pixel.className} border border-[rgb(237_237_230/0.2)] bg-[rgb(11_11_12/0.6)] px-2.5 py-1.5 text-[9px] text-[#a9a9a2] backdrop-blur-sm hover:border-[#ededE6] hover:text-[#ededE6] ${className}`}
			>
				Credits
			</button>
			{open && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="Credits"
					className="absolute bottom-16 right-4 z-30 w-[min(24rem,calc(100%-2rem))] border border-[rgb(237_237_230/0.14)] bg-[rgb(11_11_12/0.92)] p-5 text-[#ededE6] backdrop-blur-md"
				>
					<div className="flex items-start justify-between gap-4">
						<p className={`${pixel.className} text-[11px] text-[#c6f03a]`}>Credits</p>
						<button
							ref={close}
							type="button"
							onClick={() => {
								setOpen(false);
								button.current?.focus();
							}}
							aria-label="Close"
							className="grid size-7 place-items-center border border-[rgb(237_237_230/0.2)] hover:border-[#c6f03a] hover:text-[#c6f03a]"
						>
							×
						</button>
					</div>
					<ul className="mt-4 grid gap-3 text-sm">
						{models.map((m) => (
							<li key={m.what}>
								<a href={m.model} target="_blank" rel="noopener noreferrer" className="underline decoration-[rgb(237_237_230/0.3)] underline-offset-2 hover:decoration-[#c6f03a]">
									{m.what}
								</a>{" "}
								by{" "}
								<a href={m.author} target="_blank" rel="noopener noreferrer" className="underline decoration-[rgb(237_237_230/0.3)] underline-offset-2 hover:decoration-[#c6f03a]">
									{m.by}
								</a>
							</li>
						))}
					</ul>
					<p className="mt-4 text-xs leading-relaxed text-[#8a8a84]">
						All from Sketchfab under{" "}
						<a href={licence} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#ededE6]">
							CC BY 4.0
						</a>
						, scaled, recoloured and compressed for the web. Brand marks removed. Everything else, from the scene to the machines and the music, was made for this page.
					</p>
					<p className="mt-3 border-t border-[rgb(237_237_230/0.14)] pt-3 text-xs leading-relaxed text-[#8a8a84]">
						Inspired by Jesse Zhou&apos;s ramen shop, the 3D portfolio that showed how a scene like this should feel.
					</p>
				</div>
			)}
		</>
	);
}
