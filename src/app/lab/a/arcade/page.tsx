import type { Metadata } from "next";

import { FruitMenu } from "@/components/arcade/FruitMenu";
import { StackCard } from "@/components/arcade/StackCard";
import { TiltButton } from "@/components/arcade/TiltButton";
import { Reveal } from "@/components/lab/a/Reveal";
import { ReticleZone } from "@/components/lab/a/Reticle";
import { PageHead, label, mono } from "@/components/lab/a/ui";
import { canonical } from "@/lib/site-seo";

export const metadata: Metadata = {
	title: "Arcade — Omkar Arora",
	description: "Small interface experiments by Omkar Arora, all of them playable: motion, focus states and orchestration.",
	...canonical("/arcade"),
};

const cabinets = [
	{
		id: "tilt-button",
		name: "Tilt button",
		tags: ["Motion", "3D transforms"],
		note: "Tips back in 3D and lights up when aimed at.",
		howTo: "Hover it, or tab to it",
		ref: "https://youtu.be/FMA79Lnzefc",
		Play: TiltButton,
	},
	{
		id: "clerk-card",
		name: "Clerk card",
		tags: ["AnimatePresence", "Blur"],
		note: "Dissolves away when dismissed; the panel inside sharpens when you point at it.",
		howTo: "Point at the grey panel, then dismiss the chip",
		ref: undefined,
		Play: StackCard,
	},
	{
		id: "fruit-menu",
		name: "Fruit menu",
		tags: ["Variants", "Stagger"],
		note: "A dropdown whose options arrive one after another, and leave in reverse.",
		howTo: "Open it; Esc closes",
		ref: "https://www.youtube.com/watch?v=XtOJlF9UuiU",
		Play: FruitMenu,
	},
];

export default function Arcade() {
	return (
		<ReticleZone>
			<PageHead kicker={`Arcade · ${cabinets.length} cabinets`} title="Arcade.">
				Small interface experiments, all playable. Point at things.
			</PageHead>

			<div className="grid gap-4 pb-12 lg:grid-cols-3">
				{cabinets.map(({ id, name, tags, note, howTo, ref, Play }, index) => (
					<Reveal as="article" index={index} key={id} className="flex flex-col border border-[var(--ink)]">
						<header id={id} className="scroll-mt-8 border-b border-[var(--ink)] px-4 py-3">
							<h2 className={`${mono} text-sm font-bold uppercase tracking-[0.14em]`}>
								<span className="text-[var(--accent-ink)]">{String(index + 1).padStart(2, "0")}</span> {name}
							</h2>
							<p className={`${label} mt-1`}>{tags.join(" · ")}</p>
						</header>

						{/* The stage: dotted, like a cutting mat. */}
						<div
							className="flex min-h-[24rem] flex-1 items-center justify-center p-6"
							style={{
								backgroundImage: "radial-gradient(circle at 1px 1px, var(--line) 1px, transparent 0)",
								backgroundSize: "12px 12px",
							}}
						>
							<Play />
						</div>

						<footer className="border-t border-[var(--line)] px-4 py-3">
							<p className="text-sm leading-relaxed">{note}</p>
							<p className={`${label} mt-2 flex flex-wrap justify-between gap-2`}>
								<span>▶ {howTo}</span>
								{ref && (
									<a href={ref} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ink)]">
										Learned from ↗
									</a>
								)}
							</p>
						</footer>
					</Reveal>
				))}
			</div>
		</ReticleZone>
	);
}
