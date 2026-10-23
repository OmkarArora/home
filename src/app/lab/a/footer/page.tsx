import type { Metadata } from "next";

import { Footer, type FooterVariant } from "@/components/lab/a/Footer";
import { PageHead, mono } from "@/components/lab/a/ui";

export const metadata: Metadata = { title: "Footer options — Omkar Arora" };

const options: { variant: FooterVariant; name: string }[] = [
	{ variant: "say-hi", name: "Say hi" },
	{ variant: "continue", name: "Continue?" },
	{ variant: "plain", name: "Plain" },
];

/** The three footer invitations, one after another. The real footer below uses option 1. */
export default function FooterLab() {
	return (
		<>
			<PageHead kicker="Lab · footer" title="Pick a footer.">
				Three ways to end every page. All three keep the address small, with a copy button. The real footer at the
				bottom of this page is option 1.
			</PageHead>
			{options.map(({ variant, name }, index) => (
				<section key={variant} className="pt-8">
					<p className={`${mono} text-sm font-bold uppercase tracking-[0.14em]`}>
						<span className="text-[var(--accent-ink)]">{String(index + 1).padStart(2, "0")}</span> {name}
					</p>
					<Footer variant={variant} />
				</section>
			))}
		</>
	);
}
