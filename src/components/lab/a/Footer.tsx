import Link from "next/link";

import { identity } from "@/content/profile";
import { versions } from "@/content/site-history";

import { CopyEmail } from "./CopyEmail";
import { base, label, mono } from "./ui";

export type FooterVariant = "say-hi" | "continue" | "plain";

const big = "text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.95] font-extrabold tracking-[-0.03em] [font-stretch:85%]";
const button = `${mono} px-4 py-3 text-xs font-bold uppercase tracking-wider`;

/** The invitation at the bottom of every page, three ways (compared at /lab/a/footer). */
function Invite({ variant }: { variant: FooterVariant }) {
	const mail = `mailto:${identity.email}`;

	if (variant === "continue") {
		return (
			<>
				<p className={label}>Game over? Not yet.</p>
				<p className={`${big} mt-4`}>Continue?</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<a href={mail} className={`${button} bg-[var(--lime)] text-[#0c0c0d] transition-transform hover:-translate-y-0.5`}>
						▶ Yes, email me
					</a>
					<a href="#top" className={`${button} border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)]`}>
						No, back to top
					</a>
				</div>
			</>
		);
	}

	if (variant === "plain") {
		return (
			<>
				<p className={label}>Contact</p>
				<p className={`${big} mt-4`}>Let&apos;s build something.</p>
				<div className="mt-8 flex flex-wrap gap-3">
					<a href={mail} className={`${button} bg-[var(--ink)] text-[var(--bg)] transition-transform hover:-translate-y-0.5`}>
						Email me
					</a>
					<a href={identity.links.linkedin} className={`${button} border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)]`}>
						LinkedIn
					</a>
				</div>
			</>
		);
	}

	return (
		<>
			<p className={label}>Continue?</p>
			<a href={mail} className={`${big} group mt-4 block hover:text-[var(--accent-ink)]`}>
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

export function Footer({ variant = "say-hi" }: { variant?: FooterVariant }) {
	return (
		<footer id="contact" className="mt-12 border-t border-[var(--ink)] py-16">
			<Invite variant={variant} />
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
						href={`${base}/history`}
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
