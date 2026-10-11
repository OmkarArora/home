import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

import { Footer } from "@/components/lab/a/Footer";
import { RevealConfig } from "@/components/lab/a/Reveal";
import { TopBar } from "@/components/lab/a/TopBar";

const display = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--lab-display",
	axes: ["wdth", "opsz"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--lab-mono" });

/**
 * Version A's palette. One accent — an acid lime (`--lime`) that reads as a
 * highlight block on light paper and as live text on dark. On light it is never
 * used for text, which is what `--accent-ink` is for.
 */
const palette = `
[data-lab="a"] {
	--bg: #f3f3ee; --ink: #0c0c0d; --dim: #6b6b66; --line: rgb(12 12 13 / 0.14);
	--card: #ffffff; --soft: #e8e8e1; --lime: #c6f03a; --accent-ink: #3f6212;
}
.dark [data-lab="a"] {
	--bg: #0b0b0c; --ink: #ededE6; --dim: #8a8a84; --line: rgb(237 237 230 / 0.14);
	--card: #121214; --soft: #1a1a1d; --lime: #c6f03a; --accent-ink: #c6f03a;
}

/*
 * The blog's MDX components and the shared UI kit are written against the
 * site-wide colour tokens. Inside version A those tokens point at A's palette,
 * so demos and code blocks take on its look without a second copy of each.
 */
[data-lab="a"] {
	--background: var(--bg); --foreground: var(--ink);
	--card-foreground: var(--ink);
	--muted: var(--soft); --muted-foreground: var(--dim);
	--secondary: var(--soft); --secondary-foreground: var(--ink);
	--accent: var(--soft); --accent-foreground: var(--ink);
	--primary: var(--ink); --primary-foreground: var(--bg);
	--border: var(--line); --input: var(--line); --ring: var(--ink);
	--radius: 0px;
	--font-geist-sans: var(--lab-display); --font-geist-mono: var(--lab-mono);
}

/* The opening of each page rises in on load: CSS, so it runs before any script. */
@keyframes lab-a-rise { from { opacity: 0; transform: translateY(20px); } }
[data-lab="a"] .rise {
	animation: lab-a-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
	animation-delay: calc(var(--rise, 0) * 80ms + 60ms);
}
@media (prefers-reduced-motion: reduce) {
	[data-lab="a"] .rise { animation-name: none; }
}
`;

export default function LabALayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			data-lab="a"
			className={`${display.variable} ${mono.variable} min-h-screen bg-[var(--bg)] text-[var(--ink)] [font-family:var(--lab-display)]`}
		>
			<style>{palette}</style>
			{/* Without scripts nothing would ever scroll into view, so show it all. */}
			<noscript>
				<style>{"[data-reveal] { opacity: 1 !important; transform: none !important; }"}</style>
			</noscript>
			<RevealConfig>
				<div className="mx-auto max-w-6xl px-5 sm:px-8">
					<TopBar />
					<main>{children}</main>
					<Footer />
				</div>
			</RevealConfig>
		</div>
	);
}
