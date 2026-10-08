import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";

const versions = [
	{
		href: "/lab/a",
		letter: "A",
		name: "Patch notes",
		idea: "Gamer and developer native: a player card up top, ixigo work as versioned release notes, projects as side quests.",
		type: "Bricolage Grotesque + JetBrains Mono · acid lime",
	},
	{
		href: "/lab/b",
		letter: "B",
		name: "Editorial",
		idea: "The quiet one: serif-led, numbered sections, ixigo work as an index table. Closest in spirit to the reference, without its magazine concept.",
		type: "Instrument Serif + Archivo + IBM Plex Mono · vermilion",
	},
	{
		href: "/lab/c",
		letter: "C",
		name: "Panels",
		idea: "Anime and comic energy, kept disciplined: ink-bordered panels, screentone, a speech bubble and a 'to be continued'.",
		type: "Anton + Manrope + Space Mono · manga red",
	},
];

/** The lab's front door: three candidate home pages, one click each. */
export default function Lab() {
	return (
		<main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
			<div className="flex items-center justify-between">
				<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
					Design lab · drafts, not live
				</p>
				<ModeToggle />
			</div>
			<h1 className="mt-6 text-4xl font-bold tracking-tight">Three home pages</h1>
			<p className="mt-3 text-muted-foreground">
				Same content in each — anything in brackets or marked “placeholder”
				is waiting on real details. Open them on a phone too, and try dark mode.
			</p>
			<ol className="mt-10 divide-y divide-border border-y border-border">
				{versions.map((version) => (
					<li key={version.href}>
						<Link href={version.href} className="group grid grid-cols-[3rem_1fr_auto] items-start gap-4 py-6">
							<span className="font-mono text-3xl font-bold text-muted-foreground group-hover:text-foreground">
								{version.letter}
							</span>
							<div>
								<h2 className="text-xl font-semibold">{version.name}</h2>
								<p className="mt-1 text-muted-foreground">{version.idea}</p>
								<p className="mt-2 font-mono text-xs text-muted-foreground">{version.type}</p>
							</div>
							<span className="text-xl text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
						</Link>
					</li>
				))}
			</ol>
			<Link href="/" className="mt-8 inline-block text-sm text-muted-foreground hover:text-foreground">
				← The current site
			</Link>
		</main>
	);
}
