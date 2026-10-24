"use client";

import { MotionConfig, motion } from "motion/react";

/**
 * Below-the-fold blocks rise into place the first time they scroll into view,
 * and stay put after that. (The hero animates with plain CSS instead — see
 * `.rise` in the layout — so it is never blank while scripts load.)
 *
 * With reduced motion on, things only fade: nothing moves.
 */

const tags = {
	div: motion.div,
	li: motion.li,
	section: motion.section,
	article: motion.article,
};

export function Reveal({
	as = "div",
	index = 0,
	className,
	children,
}: {
	as?: keyof typeof tags;
	/** Position in a list: each one starts a beat after the last. */
	index?: number;
	className?: string;
	children: React.ReactNode;
}) {
	const Tag = tags[as];
	return (
		<Tag
			data-reveal
			className={className}
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "0px 0px -10% 0px" }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 6) * 0.06 }}
		>
			{children}
		</Tag>
	);
}

export function RevealConfig({ children }: { children: React.ReactNode }) {
	return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
