import type { Metadata } from "next";
import Image from "next/image";

import { Reveal } from "@/components/site/Reveal";
import { Trace } from "@/components/site/Trace";
import { PageHead, label, mono } from "@/components/site/ui";
import { versions } from "@/content/site-history";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/history", {
		title: "Version history — Omkar Arora",
		description: "Every version of Omkar Arora's site, from a 2020 college portfolio on Netlify to the one you're reading.",
	}),
};

/** A stop on the line, which lights up once the line reaches it. */
const stop = `${mono} text-sm font-bold uppercase tracking-[0.14em] text-[var(--dim)] transition-colors duration-300 data-[on=true]:text-[var(--ink)]`;

export default function History() {
	return (
		<>
			<PageHead kicker={`This site · ${versions.length} versions`} title="Version history.">
				Every version of this site, newest first. Screens are from each one as it last looked.
			</PageHead>

			<Trace className="pb-8">
				{versions.map((version) => (
					<section key={version.key} className="pb-16">
						<h2 data-trace-node className={`${stop} flex flex-wrap gap-x-3`}>
							<span className="text-[var(--accent-ink)]">{version.label}</span>
							<span>{version.when}</span>
						</h2>
						<Reveal as="article" className="mt-5">
							<h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{version.name}</h3>
							<p className={`${label} mt-2`}>
								{version.address} · {version.status}
							</p>
							<p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--dim)]">{version.summary}</p>
							<ul className="mt-4 max-w-2xl space-y-1.5 leading-relaxed">
								{version.notes.map((note) => (
									<li key={note} className="grid grid-cols-[1rem_1fr] before:text-[var(--accent-ink)] before:content-['+']">
										{note}
									</li>
								))}
							</ul>

							<div className="mt-8 grid items-end gap-4 sm:grid-cols-[1fr_9rem] md:grid-cols-[1fr_11rem]">
								<figure>
									<Image
										src={`/images/history/${version.key}-desktop.jpg`}
										alt={`${version.name} on a desktop screen`}
										width={1440}
										height={900}
										sizes="(min-width: 768px) 800px, 100vw"
										className="w-full border border-[var(--ink)]"
									/>
									<figcaption className={`${label} mt-2`}>Desktop</figcaption>
								</figure>
								<figure className="hidden sm:block">
									<Image
										src={`/images/history/${version.key}-mobile.jpg`}
										alt={`${version.name} on a phone`}
										width={390}
										height={844}
										sizes="176px"
										className="w-full border border-[var(--ink)]"
									/>
									<figcaption className={`${label} mt-2`}>Phone</figcaption>
								</figure>
							</div>
						</Reveal>
					</section>
				))}
			</Trace>
		</>
	);
}
