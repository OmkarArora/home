"use client";

import { SectionHead, label } from "@/components/site/ui";

import { machines } from "../machines";
import { NeonSign } from "../NeonSign";

/**
 * Layout C, the site's own style: every machine on the page at once, one
 * section each, with the screen beside its explanation and knobs. No cabinet.
 */
export function Cards() {
	return (
		<div className="space-y-20 pb-16">
			<div className="flex justify-center bg-[#0a0a0b] py-6">
				<NeonSign text="Arcade" broken={4} className="text-[clamp(2rem,8vw,4rem)] tracking-[0.25em]" />
			</div>
			{machines.map((machine, i) => (
				<section key={machine.key} id={machine.key} className="scroll-mt-8">
					<SectionHead tag={`${String(i + 1).padStart(2, "0")} · ${machine.tag}`} title={machine.name} meaning={machine.tag} />
					<machine.Play
						layout={(screen, knobs) => (
							<div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
								<div className="border border-[var(--ink)]">{screen}</div>
								<div>
									<p className={label}>How it works</p>
									<p className="mt-2 leading-relaxed">{machine.how}</p>
									{knobs}
								</div>
							</div>
						)}
					/>
				</section>
			))}
		</div>
	);
}
