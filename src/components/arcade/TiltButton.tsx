"use client";

import { motion } from "motion/react";

/**
 * A button that tips back in 3D and lights up when you aim at it, by mouse or
 * by keyboard focus. With reduced motion it only lights up.
 *
 * After https://youtu.be/FMA79Lnzefc
 */
export function TiltButton() {
	const lifted = {
		rotateX: 25,
		rotateY: 20,
		y: -5,
		boxShadow: "0px 20px 50px rgb(198 240 58 / 0.45)",
	};

	return (
		<div className="[perspective:1000px] [transform-style:preserve-3d]">
			<motion.button
				type="button"
				whileHover={lifted}
				whileFocus={lifted}
				whileTap={{ y: 0 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				style={{ translateZ: 100 }}
				className="group relative rounded-lg bg-[#0c0c0d] px-12 py-4 font-[family-name:var(--lab-mono)] text-sm font-bold uppercase tracking-widest text-neutral-400 shadow-[0px_1px_4px_0px_rgba(255,255,255,0.1)_inset,0px_-1px_2px_0px_rgba(255,255,255,0.1)_inset] outline-none"
			>
				<span className="transition-colors duration-300 group-hover:text-[#c6f03a] group-focus-visible:text-[#c6f03a]">
					Press start
				</span>
				<span className="absolute inset-x-0 bottom-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-[#c6f03a] to-transparent" />
				<span className="absolute inset-x-0 bottom-px mx-auto h-[4px] w-full bg-gradient-to-r from-transparent via-[#c6f03a] to-transparent opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
			</motion.button>
		</div>
	);
}
