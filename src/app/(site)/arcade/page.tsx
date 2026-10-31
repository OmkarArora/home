import type { Metadata } from "next";

import { Arcade } from "@/components/arcade/Arcade";
import { machines } from "@/components/arcade/machines";
import { JsonLd } from "@/components/json-ld";
import { graph, ids, pageMetadata, webPage, website } from "@/lib/site-seo";

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
			<JsonLd
				json={graph(
					webPage("/arcade", {
						name: "Arcade",
						description: String(metadata.description),
						mainEntity: {
							"@type": "WebApplication",
							name: "Omkar's Arcade",
							url: "https://omkararora.com/arcade",
							description: String(metadata.description),
							applicationCategory: "GameApplication",
							operatingSystem: "Any",
							browserRequirements: "Requires WebGL for the 3D arcade; without it, a 2D one.",
							isAccessibleForFree: true,
							author: { "@id": ids.person },
							// The machines on the cabinet: each a trick this site uses, made playable.
							hasPart: machines.map((machine) => ({ "@type": "CreativeWork", name: machine.name, description: machine.how })),
						},
					}),
					website(),
				)}
			/>
			<h1 className="sr-only">Omkar&apos;s Arcade</h1>
			<p className="sr-only">
				A 3D arcade under a night sky. Play the tricks this site is built from on a real cabinet: the flap board, the
				polaroid stack and the 8-bit sound board. Watch Pong on the TV, spin a record, and find the seven dragon balls.
			</p>
			<Arcade full />
		</>
	);
}
