"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * An aiming reticle in place of the cursor, inside this zone only.
 *
 * Everywhere else the system cursor stays: a custom one across a whole site
 * fights text selection and hides the link hand. Over a link or button the ring
 * tightens, like aiming down sights.
 *
 * It is drawn white with `mix-blend-mode: difference`, so it stays visible on
 * paper, on the lime panel and in dark mode without knowing which it is over.
 * Touch screens never see it, and with reduced motion it follows the pointer
 * exactly and does not spin.
 *
 * The reticle itself renders into <body>: `position: fixed` measures from the
 * nearest transformed ancestor, and entrance animations transform things.
 */
export function ReticleZone({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const zone = useRef<HTMLDivElement>(null);
	const reticle = useRef<HTMLDivElement>(null);
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)");
		const update = () => setEnabled(fine.matches);
		update();
		fine.addEventListener("change", update);
		return () => fine.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		const area = zone.current;
		const mark = reticle.current;
		if (!enabled || !area || !mark) return;

		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
		const target = { x: 0, y: 0 };
		const at = { x: 0, y: 0 };
		let frame = 0;
		let inside = false;

		const place = () => {
			mark.style.transform = `translate3d(${at.x}px, ${at.y}px, 0)`;
		};

		// Ease towards the pointer, and stop asking for frames once it is there.
		const tick = () => {
			const ease = reduce.matches ? 1 : 0.35;
			at.x += (target.x - at.x) * ease;
			at.y += (target.y - at.y) * ease;
			place();
			const settled =
				Math.abs(target.x - at.x) < 0.1 && Math.abs(target.y - at.y) < 0.1;
			frame = settled ? 0 : requestAnimationFrame(tick);
		};

		const onMove = (event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			target.x = event.clientX;
			target.y = event.clientY;
			if (!inside) {
				// Appear where the pointer is, rather than sliding in from the last exit.
				inside = true;
				at.x = target.x;
				at.y = target.y;
				place();
				mark.dataset.visible = "true";
			}
			const aiming = (event.target as Element).closest("a, button") !== null;
			mark.dataset.aim = String(aiming);
			if (!frame) frame = requestAnimationFrame(tick);
		};

		const onLeave = () => {
			inside = false;
			mark.dataset.visible = "false";
		};

		area.addEventListener("pointermove", onMove);
		area.addEventListener("pointerleave", onLeave);
		return () => {
			area.removeEventListener("pointermove", onMove);
			area.removeEventListener("pointerleave", onLeave);
			cancelAnimationFrame(frame);
		};
	}, [enabled]);

	return (
		<div
			ref={zone}
			data-reticle-zone
			className={`${className} ${enabled ? "cursor-none [&_*]:cursor-none" : ""}`}
		>
			{children}
			{enabled &&
				createPortal(
				<div
					ref={reticle}
					aria-hidden
					data-reticle
					data-visible="false"
					data-aim="false"
					className="group/reticle pointer-events-none fixed top-0 left-0 z-50 opacity-0 mix-blend-difference transition-opacity duration-150 data-[visible=true]:opacity-100"
				>
					<div className="relative -translate-x-1/2 -translate-y-1/2">
						{/* The ring, with four ticks that turn slowly; it closes in when aiming. */}
						<div className="size-10 transition-transform duration-200 ease-out group-data-[aim=true]/reticle:scale-[0.6]">
							<div className="size-full rounded-full border border-white/70 group-data-[aim=true]/reticle:border-white motion-safe:animate-[spin_9s_linear_infinite]">
								<span className="absolute top-[-4px] left-1/2 h-2 w-px -translate-x-1/2 bg-white" />
								<span className="absolute bottom-[-4px] left-1/2 h-2 w-px -translate-x-1/2 bg-white" />
								<span className="absolute top-1/2 left-[-4px] h-px w-2 -translate-y-1/2 bg-white" />
								<span className="absolute top-1/2 right-[-4px] h-px w-2 -translate-y-1/2 bg-white" />
							</div>
						</div>
						<span className="absolute top-1/2 left-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-white/80" />
						<span className="absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/80" />
						<span className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
					</div>
				</div>,
					document.body,
				)}
		</div>
	);
}
