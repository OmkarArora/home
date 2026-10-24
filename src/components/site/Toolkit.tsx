import { identity, toolkit } from "@/content/profile";

import { Reveal } from "./Reveal";
import { SectionHead, label, mono } from "./ui";

/**
 * The tools he works with, grouped as on his resume, in a ruled grid of chips.
 * The everyday ones ("main") are filled in lime; the rest are outlined. The
 * last cell holds the key and a link to the full resume.
 */
export function Toolkit({ tag = "Tools of the trade" }: { tag?: string }) {
	return (
		<section className="py-12">
			<SectionHead title="Loadout" tag={tag} />
			<div className="mt-6 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
				{toolkit.map((group, index) => (
					<Reveal key={group.name} index={index} className="bg-[var(--bg)] p-5">
						<h3 className={label}>{group.name}</h3>
						<ul className={`${mono} mt-4 flex flex-wrap gap-2 text-xs`}>
							{/* Everyday tools lead each group. */}
							{[...group.tools].sort((a, b) => Number(!!b.main) - Number(!!a.main)).map((tool) => (
								<li
									key={tool.name}
									className={
										tool.main
											? "bg-[var(--lime)] px-2.5 py-1.5 font-bold text-[#0c0c0d]"
											: "border border-[var(--line)] px-2.5 py-1.5 text-[var(--ink)]"
									}
								>
									{tool.name}
								</li>
							))}
						</ul>
					</Reveal>
				))}
				<div className="flex flex-col justify-between gap-6 bg-[var(--bg)] p-5">
					<div className={`${label} space-y-2`}>
						<p className="flex items-center gap-2">
							<span aria-hidden className="inline-block size-2.5 bg-[var(--lime)]" /> Every day
						</p>
						<p className="flex items-center gap-2">
							<span aria-hidden className="inline-block size-2.5 border border-[var(--dim)]" /> Comfortable with
						</p>
					</div>
					<a
						href={identity.links.resume}
						target="_blank"
						rel="noopener noreferrer"
						className={`${mono} self-start text-xs font-bold uppercase tracking-wider hover:text-[var(--accent-ink)]`}
					>
						Full résumé ↗
					</a>
				</div>
			</div>
		</section>
	);
}
