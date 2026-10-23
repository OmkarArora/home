import Link from "next/link";

import { identity } from "@/content/profile";
import { versions } from "@/content/site-history";

import { CopyEmail } from "./CopyEmail";
import { label, mono } from "./ui";

const big = "text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] [font-stretch:85%]";

/** The invitation at the bottom of every page. */
function Invite() {
	return (
		<>
			<p className={label}>Continue?</p>
			<a href={`mailto:${identity.email}`} className={`${big} group mt-4 block hover:text-[var(--accent-ink)]`}>
				Got something to build?{" "}
				<span className="whitespace-nowrap underline decoration-[var(--lime)] decoration-[0.12em] underline-offset-[0.12em] [text-decoration-skip-ink:none]">
					Say hi
					<span aria-hidden className="ml-[0.25em] inline-block no-underline transition-transform group-hover:translate-x-2">
						→
					</span>
				</span>
			</a>
		</>
	);
}

export function Footer() {
	return (
		<footer id="contact" className="mt-12 border-t border-[var(--ink)] py-16">
			<Invite />
			<div className="mt-6">
				<CopyEmail email={identity.email} />
			</div>
			<div
				className={`${mono} mt-12 flex flex-wrap justify-between gap-4 text-xs uppercase tracking-wider text-[var(--dim)]`}
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
				<span>
					© {new Date().getFullYear()} ·{" "}
					<Link
						href="/history"
						title="Version history of this site"
						className="underline decoration-[var(--lime)] decoration-2 underline-offset-4 hover:text-[var(--ink)]"
					>
						{versions[0].label}
					</Link>{" "}
					· Press start
				</span>
			</div>
		</footer>
	);
}
