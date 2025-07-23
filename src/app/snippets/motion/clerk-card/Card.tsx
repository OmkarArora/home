"use client";

import { AnimatePresence, motion } from "motion/react";

import { HexagonIcon, X } from "lucide-react";
import { useState } from "react";

export default function Card() {
	const [open, setOpen] = useState(true);

	return (
		<>
			<AnimatePresence>
				{!open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
						animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
						exit={{
							opacity: 0,
							scale: 0.98,
							filter: "blur(10px)",
						}}
						transition={{
							duration: 0.5,
							ease: "easeInOut",
						}}
						className="fixed bottom-[50px] left-1/2 -transition-x-1/2"
					>
						<button className="cursor-pointer" onClick={() => setOpen(true)}>
							RESET
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
						animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
						exit={{
							opacity: 0,
							scale: 0.98,
							filter: "blur(10px)",
						}}
						transition={{
							duration: 0.5,
							ease: "easeInOut",
						}}
						className="bg-white w-72 h-[28rem] rounded-lg p-6 flex flex-col shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)]"
					>
						<h1 className="text-md font-bold">Card Heading</h1>
						<p className="text-sm text-gray-500">Subheading</p>

						<div className="flex items-center w-full justify-center mt-5">
							<button
								onClick={() => setOpen(false)}
								className="flex cursor-pointer items-center bg-white rounded-2xl px-2 py-1 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)]"
							>
								<HexagonIcon className="size-5" />
								&nbsp;Heaxgon&nbsp;&nbsp;
								<X className="size-5 text-neutral-400" />
							</button>
						</div>

						<div className="flex-1 bg-gray-100 rounded-lg mt-5 relative border-dashed border-neutral-200">
							<motion.div
								initial={{
									opacity: 0,
									scale: 0.98,
									filter: "blur(10px)",
								}}
								whileHover={{
									opacity: 1,
									scale: 1.05,
									filter: "blur(0px)",
								}}
								transition={{
									duration: 0.3,
									ease: "easeInOut",
								}}
								className="absolute inset-0 size-full divide-y border border-neutral-200 divide-neutral-200 bg-white rounded-lg flex flex-col"
							>
								<div className="flex-1 flex justify-center items-center">
									ROW 1
								</div>
								<div className="flex-1 flex justify-center items-center">
									ROW 2
								</div>
								<div className="flex-1 flex justify-center items-center">
									ROW 3
								</div>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
