import { identity } from "@/content/profile";

import { label, mono } from "./ui";

export function Footer() {
	return (
		<footer id="contact" className="mt-12 border-t border-[var(--ink)] py-16">
			<p className={label}>Continue?</p>
			<a
				href={`mailto:${identity.email}`}
				className="mt-4 block text-[clamp(1.75rem,6vw,4.5rem)] leading-none font-extrabold tracking-tight break-all hover:text-[var(--accent-ink)]"
			>
				{identity.email}
			</a>
			<div
				className={`${mono} mt-10 flex flex-wrap justify-between gap-4 text-xs uppercase tracking-wider text-[var(--muted)]`}
			>
				<div className="flex gap-6">
					<a href={identity.links.github} className="hover:text-[var(--ink)]">
						GitHub
					</a>
					<a href={identity.links.linkedin} className="hover:text-[var(--ink)]">
						LinkedIn
					</a>
					<a href={identity.links.resume} className="hover:text-[var(--ink)]">
						Resume
					</a>
				</div>
				<span>© {new Date().getFullYear()} · Press start</span>
			</div>
		</footer>
	);
}
