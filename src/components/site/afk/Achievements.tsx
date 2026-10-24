import { label, mono } from "../ui";
import { afk } from "./data";

/**
 * 4. Each interest as an unlocked achievement: a badge, a title, a stat. The
 * stats are his to supply, so for now they show as blanks.
 */
export function Achievements() {
	return (
		<ul className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
			{afk.map((item) => (
				<li key={item.key} className="group flex gap-4 bg-[var(--bg)] p-5">
					<span
						aria-hidden
						className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden bg-[var(--lime)] text-2xl font-extrabold text-[#0c0c0d] [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]"
					>
						{item.label[0]}
						{/* A shine that sweeps across on hover. */}
						<span className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/50 transition-[left] duration-500 group-hover:left-[150%] motion-reduce:hidden" />
					</span>
					<div className="min-w-0">
						<p className={`${mono} text-xs font-bold uppercase tracking-widest text-[var(--accent-ink)]`}>Unlocked</p>
						<p className="mt-1 font-bold tracking-tight">{item.badge}</p>
						<p className="text-sm text-[var(--dim)]">{item.label}</p>
						<p className={`${label} mt-2`}>{item.stat ?? "[your stat]"}</p>
					</div>
				</li>
			))}
		</ul>
	);
}
