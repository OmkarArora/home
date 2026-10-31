import type { Metadata } from "next";

import { Arcade } from "@/components/arcade/Arcade";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata("/arcade", {
	title: "Arcade — Omkar Arora",
	description: "A 3D arcade under a night sky: play the tricks this site is built from on a real cabinet, and find the seven dragon balls.",
});

/**
 * The 3D Arcade, filling the window (the 2D one under reduced motion, or without WebGL). The
 * heading and summary are for search and screen readers: the Arcade itself only draws once the
 * browser has chosen 3D or 2D, so without them the page would arrive empty.
 */
export default function Page() {
	return (
		<>
			<h1 className="sr-only">Omkar&apos;s Arcade</h1>
			<p className="sr-only">
				A 3D arcade under a night sky. Play the tricks this site is built from on a real cabinet: the flap board, the
				polaroid stack and the 8-bit sound board. Watch Pong on the TV, spin a record, and find the seven dragon balls.
			</p>
			<Arcade full />
		</>
	);
}
