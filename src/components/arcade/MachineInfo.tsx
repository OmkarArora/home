import { label } from "@/components/site/ui";

import type { Machine } from "./machines";
import { pixel } from "./pixelFont";

/** Beside a cabinet: the machine's number and name, what it is, how it works, and its knobs. */
export function MachineInfo({ at, machine, knobs }: { at: number; machine: Machine; knobs: React.ReactNode }) {
	return (
		<div>
			<p className={`${pixel.className} text-xs leading-relaxed text-[var(--accent-ink)]`} aria-live="polite">
				{String(at + 1).padStart(2, "0")} {machine.name.toUpperCase()}
			</p>
			<p className={`${label} mt-3`}>{machine.tag}</p>
			<p className="mt-4 leading-relaxed">{machine.how}</p>
			{knobs && (
				<div className="mt-8">
					<p className={label}>Knobs</p>
					{knobs}
				</div>
			)}
			<p className={`${label} mt-8`}>◀ ▶ or the arrow keys change machines · Start for the list</p>
		</div>
	);
}
