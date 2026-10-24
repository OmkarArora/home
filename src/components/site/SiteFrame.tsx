import localFont from "next/font/local";

import { Atmosphere } from "./Atmosphere";
import { Footer } from "./Footer";
import { RevealConfig } from "./Reveal";
import { TopBar } from "./TopBar";

/*
 * The two fonts live in the repo (Google Fonts' Latin files, variable), so a
 * build or the dev server never depends on reaching Google. Bricolage carries
 * its weight, width and optical-size axes; the headlines use the width.
 */
const display = localFont({
	src: "./fonts/bricolage-grotesque-latin.woff2",
	variable: "--font-display",
	weight: "200 800",
	style: "normal",
	display: "swap",
	declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});
const mono = localFont({
	src: "./fonts/jetbrains-mono-latin.woff2",
	variable: "--font-code",
	weight: "100 800",
	style: "normal",
	display: "swap",
});

/**
 * The site's palette. One accent — an acid lime (`--lime`) that reads as a
 * highlight block on light paper and as live text on dark. On light it is never
 * used for text, which is what `--accent-ink` is for.
 */
const palette = `
[data-site] {
	--bg: #f3f3ee; --ink: #0c0c0d; --dim: #6b6b66; --line: rgb(12 12 13 / 0.14);
	--card: #ffffff; --soft: #e8e8e1; --lime: #c6f03a; --accent-ink: #3f6212;
}
.dark [data-site] {
	--bg: #0b0b0c; --ink: #ededE6; --dim: #8a8a84; --line: rgb(237 237 230 / 0.14);
	--card: #121214; --soft: #1a1a1d; --lime: #c6f03a; --accent-ink: #c6f03a;
}

/*
 * The blog's MDX components and the shared UI kit are written against the
 * shadcn colour tokens. Here those tokens point at the site's palette,
 * so demos and code blocks take on its look without a second copy of each.
 */
[data-site] {
	--background: var(--bg); --foreground: var(--ink);
	--card-foreground: var(--ink);
	--muted: var(--soft); --muted-foreground: var(--dim);
	--secondary: var(--soft); --secondary-foreground: var(--ink);
	--accent: var(--soft); --accent-foreground: var(--ink);
	--primary: var(--ink); --primary-foreground: var(--bg);
	--border: var(--line); --input: var(--line); --ring: var(--ink);
	--radius: 0px;
}

/* The opening of each page rises in on load: CSS, so it runs before any script. */
@keyframes site-rise { from { opacity: 0; transform: translateY(20px); } }
[data-site] .rise {
	animation: site-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
	animation-delay: calc(var(--rise, 0) * 80ms + 60ms);
}
@media (prefers-reduced-motion: reduce) {
	[data-site] .rise { animation-name: none; }
}
`;

/** Every page of the site sits in this: fonts, palette, top bar and footer. */
export function SiteFrame({ children }: { children: React.ReactNode }) {
	return (
		<div
			data-site
			className={`${display.variable} ${mono.variable} min-h-screen bg-[var(--bg)] text-[var(--ink)] [font-family:var(--font-display)]`}
		>
			<style>{palette}</style>
			{/* Without scripts nothing would ever scroll into view, so show it all. */}
			<noscript>
				<style>{"[data-reveal] { opacity: 1 !important; transform: none !important; }"}</style>
			</noscript>
			<Atmosphere />
			<RevealConfig>
				{/* Above the particles. */}
				<div className="relative z-[1] mx-auto max-w-6xl px-5 sm:px-8">
					<TopBar />
					<main>{children}</main>
					<Footer />
				</div>
			</RevealConfig>
		</div>
	);
}
