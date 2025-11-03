"use client";

import { Apple, Banana, Cherry, ChevronDown, Citrus } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

// https://motion.dev/docs/vue-animation#orchestration
// https://www.youtube.com/watch?v=XtOJlF9UuiU&list=PLympUr-oxAWU43N4ZaVG1PSCHkV0kcyaK&index=5

export default function Page() {
	return <DropDown />;
}

const listItems = [
	{ id: 1, icon: <Banana />, text: "Banana" },
	{ id: 2, icon: <Apple />, text: "Apple" },
	{ id: 3, icon: <Cherry />, text: "Cherry" },
	{ id: 4, icon: <Citrus />, text: "Citrus" },
];

function DropDown() {
	const [open, setOpen] = useState(false);

	function optionClick() {
		setOpen(false);
	}

	const buttonVariants = {
		open: {
			paddingTop: "10px",
			paddingBottom: "10px",
		},
		closed: {
			paddingTop: "8px",
			paddingBottom: "8px",
		},
	};

	const parentVariants = {
		open: {
			height: "auto",
			opacity: 1,
			transition: {
				staggerChildren: 0.3,
				delayChildren: 0.1,
			},
		},
		closed: {
			height: "0px",
			opacity: 0,
			transition: {
				staggerChildren: 0.2,
				delayChildren: -1,
			},
		},
	};

	const childVariants = {
		open: {
			opacity: 1,
			y: 0,
		},
		closed: {
			opacity: 0,
			y: -10,
		},
	};

	return (
		<motion.button
			initial={false}
			animate={open ? "open" : "closed"}
			variants={buttonVariants}
			transition={{
				duration: 0.3,
				ease: "easeInOut",
			}}
			className="flex w-50 bg-gray-200 justify-between rounded-md px-2 pl-3 cursor-pointer relative hover:bg-gray-300"
			onClick={() => setOpen((prev) => !prev)}
		>
			{open ? "CLOSE" : "OPEN"}
			<ChevronDown />
			<motion.ul
				variants={parentVariants}
				className="absolute inset-x-0 w-full -bottom-1 translate-y-full bg-gray-100 rounded-t-[4px] rounded-b-[8px] overflow-hidden"
			>
				{listItems.map((item) => (
					<motion.li
						key={item.id}
						className="flex items-center justify-start gap-4 px-4 py-2"
						variants={childVariants}
						onClick={(e) => {
							e.stopPropagation();
							optionClick();
						}}
					>
						{item.icon}
						{item.text}
					</motion.li>
				))}
			</motion.ul>
		</motion.button>
	);
}
