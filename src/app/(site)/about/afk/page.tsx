import type { Metadata } from "next";

import { HoverList } from "@/components/site/afk/HoverList";
import { Scrapbook } from "@/components/site/afk/Scrapbook";
import { PageHead, label } from "@/components/site/ui";

/** Takes on About's AFK section, side by side. Temporary: delete once one is picked. */
export const metadata: Metadata = {
	title: "AFK, three ways",
	robots: { index: false, follow: false },
};

function Combo() {
	return (
		<>
			<HoverList />
			<p className={`${label} mt-12 mb-6`}>Sketchbook & snapshots</p>
			<Scrapbook picturesOnly />
		</>
	);
}

const options = [
	{ name: "Hover-reveal list", note: "Big words; point at one and its picture follows. Tap on a phone.", View: HoverList },
	{ name: "Scrapbook wall", note: "Photos, art and notes, a little crooked. Hover to straighten one.", View: () => <Scrapbook /> },
	{
		name: "Both: the list, then the wall",
		note: "The interests as the hover list, then a wall of just the art and photos underneath.",
		View: Combo,
	},
];

export default function AfkOptions() {
	return (
		<>
			<PageHead kicker="About · comparing layouts" title="AFK, three ways.">
				Same content in each: Art and Travel added (Travel suggested from your photos). Lines marked Draft are yours to
				write.
			</PageHead>
			{options.map(({ name, note, View }, index) => (
				<section key={name} className="border-t border-[var(--ink)] py-12">
					<p className={label}>Option {index + 1}</p>
					<h2 className="mt-2 text-3xl font-extrabold tracking-tight">{name}</h2>
					<p className="mt-1 mb-8 text-[var(--dim)]">{note}</p>
					<View />
				</section>
			))}
		</>
	);
}
