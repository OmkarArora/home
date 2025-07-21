"use client";

import { motion } from "motion/react";

/**
 * Ref: https://youtu.be/FMA79Lnzefc?si=dY51HrI9cUbmixjU
 */

export default function Button() {
	return (
		<div
			className="[perspective:1000px] [transform-style:preserve-3d] flex h-screen w-screen items-center justify-center"
			style={{
				backgroundImage: `radial-gradient(circle at 0.5px 0.5px, rgba(6,182,212,0.2) 0.5px, transparent 0)`,
				backgroundSize: "8px 8px",
				backgroundRepeat: "repeat",
			}}
		>
			<motion.button
				// initial={{ rotate: 0 }}
				// animate={{ rotate: [0, 10, 0] }}
				whileHover={{
					rotateX: 25,
					rotateY: 20,
					boxShadow: "0px 20px 50px rgba(8,112,184,0.7)",
					y: -5,
				}}
				whileTap={{
					y: 0,
				}}
				transition={{
					duration: 0.3,
					ease: "easeInOut",
				}}
				style={{
					translateZ: 100,
				}}
				className="text-neutral-500 px-12 py-4 rounded-lg bg-black cursor-pointer shadow-[0px_1px_4px_0px_rgba(255,255,255,0.1)_inset,0px_-1px_2px_0px_rgba(255,255,255,0.1)_inset] relative group"
			>
				<span className="group-hover:text-cyan-500 transition-colors duration-300">
					Subscribe
				</span>
				<span className="absolute inset-x-0 bottom-px  bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-px w-3/4 mx-auto" />
				<span className="absolute inset-x-0 bottom-px  bg-gradient-to-r from-transparent via-cyan-500 to-transparent h-[4px] w-full mx-auto blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</motion.button>
		</div>
	);
}
