"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { Screen } from "@/content/sparklin";

import { mono } from "./ui";

/**
 * A strip of screenshots. Picking one opens it full size in a dialog, where
 * the arrow keys (or the buttons) step through the rest and Esc closes.
 */
export function Screens({ screens }: { screens: Screen[] }) {
	const dialog = useRef<HTMLDialogElement>(null);
	const [current, setCurrent] = useState(0);

	if (screens.length === 0) return null;
	const shown = screens[current];
	const step = (by: number) => setCurrent((index) => (index + by + screens.length) % screens.length);
	const control = `${mono} border border-[var(--ink)] bg-[var(--bg)] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[var(--ink)] hover:bg-[var(--lime)] hover:text-[#0c0c0d]`;

	return (
		<>
			<ul className="mt-6 flex gap-3 overflow-x-auto pb-2">
				{screens.map((screen, index) => (
					<li key={screen.src} className="shrink-0">
						<button
							type="button"
							aria-label={`Open ${screen.alt}`}
							onClick={() => {
								setCurrent(index);
								dialog.current?.showModal();
							}}
							className="block w-56 border border-[var(--ink)] transition-transform hover:-translate-y-0.5 sm:w-64"
						>
							<Image
								src={screen.src}
								alt={screen.alt}
								width={screen.width}
								height={screen.height}
								sizes="256px"
								className="aspect-[16/10] w-full object-cover object-top"
							/>
						</button>
					</li>
				))}
			</ul>

			<dialog
				ref={dialog}
				aria-label={shown.alt}
				onClick={(event) => {
					// A click on the backdrop lands on the dialog itself.
					if (event.target === event.currentTarget) event.currentTarget.close();
				}}
				onKeyDown={(event) => {
					if (event.key === "ArrowRight") step(1);
					if (event.key === "ArrowLeft") step(-1);
				}}
				className="m-auto max-h-[92vh] w-[min(92vw,80rem)] border border-[var(--ink)] bg-[var(--bg)] p-0 text-[var(--ink)] backdrop:bg-black/75"
			>
				<div className="flex items-center justify-between gap-3 border-b border-[var(--ink)] p-2">
					<span className={`${mono} px-2 text-xs uppercase tracking-wider`}>
						{current + 1} / {screens.length}
					</span>
					<div className="flex gap-2">
						{screens.length > 1 && (
							<>
								<button type="button" className={control} onClick={() => step(-1)} aria-label="Previous screen">
									←
								</button>
								<button type="button" className={control} onClick={() => step(1)} aria-label="Next screen">
									→
								</button>
							</>
						)}
						<button type="button" className={control} onClick={() => dialog.current?.close()}>
							Close
						</button>
					</div>
				</div>
				<Image
					src={shown.src}
					alt={shown.alt}
					width={shown.width}
					height={shown.height}
					sizes="(max-width: 1280px) 92vw, 1280px"
					className="max-h-[calc(92vh-3.5rem)] w-full object-contain"
				/>
			</dialog>
		</>
	);
}
