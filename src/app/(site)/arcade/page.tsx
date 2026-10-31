import type { Metadata } from "next";

import { Arcade } from "@/components/arcade/Arcade";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata("/arcade", {
	title: "Arcade — Omkar Arora",
	description: "A 3D arcade under a night sky: play the tricks this site is built from on a real cabinet, and find the seven dragon balls.",
});

/** The 3D Arcade, filling the window (the 2D one under reduced motion, or without WebGL). */
export default function Page() {
	return <Arcade full />;
}
