import type { Metadata } from "next";

import { PageHead } from "@/components/site/ui";

import { SoundLab } from "./SoundLab";

/** Comparing voices for the sound effects. Temporary: delete once one is picked. */
export const metadata: Metadata = {
	title: "Sound lab",
	robots: { index: false, follow: false },
};

export default function SoundLabPage() {
	return (
		<>
			<PageHead kicker="Sound · comparing voices" title="Sound lab.">
				Every sound in five voices. These play even with the speaker off. Pick a column to hear the hover run in it.
			</PageHead>
			<SoundLab />
		</>
	);
}
