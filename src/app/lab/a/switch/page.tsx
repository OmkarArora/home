import type { Metadata } from "next";

import { EclipseSwitch, SlideSwitch, WordSwitch } from "@/components/lab/a/ThemeSwitch";
import { PageHead, label, mono } from "@/components/lab/a/ui";

export const metadata: Metadata = { title: "Theme switch options — Omkar Arora" };

const options = [
	{ name: "Slider", note: "A square knob slides along a track, sun one end, moon the other. Plain, and unmistakably a switch.", Switch: SlideSwitch },
	{ name: "Eclipse", note: "One button. Going dark, a disc slides across the sun to leave a crescent and the rays draw in.", Switch: EclipseSwitch },
	{ name: "Words", note: "LIGHT | DARK in mono, with the lime block sliding under the one that's on. The most A-looking.", Switch: WordSwitch },
];

/** The three switch designs side by side, all live: they all drive the same theme. */
export default function SwitchLab() {
	return (
		<>
			<PageHead kicker="Lab · theme switch" title="Pick a switch.">
				All three are live and drive the same theme, so they move together. A first visit follows your
				system; after you flip one, &ldquo;Auto&rdquo; appears to hand control back to the system.
			</PageHead>
			<div className="grid gap-4 pb-16 md:grid-cols-3">
				{options.map(({ name, note, Switch }, index) => (
					<article key={name} className="flex flex-col border border-[var(--ink)]">
						<h2 className={`${mono} border-b border-[var(--ink)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em]`}>
							<span className="text-[var(--accent-ink)]">{String(index + 1).padStart(2, "0")}</span> {name}
						</h2>
						<div className="flex min-h-48 flex-1 items-center justify-center p-6">
							<Switch />
						</div>
						<p className="border-t border-[var(--line)] px-4 py-3 text-sm leading-relaxed">{note}</p>
					</article>
				))}
			</div>
			<p className={`${label} pb-16`}>The top bar uses option 1 for now.</p>
		</>
	);
}
