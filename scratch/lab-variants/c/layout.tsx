import { Anton, Manrope, Space_Mono } from "next/font/google";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--lab-display" });
const body = Manrope({ subsets: ["latin"], variable: "--lab-body" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--lab-mono" });

/**
 * Version C's palette: newsprint and ink, one manga red. The screentone is the
 * ink colour at low opacity, so it inverts with the theme for free.
 */
const palette = `
[data-lab="c"] {
	--bg: #f4f1e8; --panel: #fffdf6; --ink: #0a0a0a; --muted: #57534a;
	--accent: #e01e2b; --on-accent: #fffdf6;
}
.dark [data-lab="c"] {
	--bg: #0b0b0d; --panel: #151518; --ink: #f2efe6; --muted: #a29e94;
	--accent: #ff3443; --on-accent: #0b0b0d;
}
[data-lab="c"] .tone {
	background-image: radial-gradient(var(--ink) 1.1px, transparent 1.3px);
	background-size: 7px 7px;
	opacity: 0.16;
}
[data-lab="c"] .speed {
	background: repeating-conic-gradient(from 0deg at 50% 50%, var(--ink) 0deg 1.2deg, transparent 1.2deg 9deg);
	opacity: 0.12;
}
`;

export default function LabCLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			data-lab="c"
			className={`${display.variable} ${body.variable} ${mono.variable} min-h-screen bg-[var(--bg)] text-[var(--ink)] [font-family:var(--lab-body)]`}
		>
			<style>{palette}</style>
			{children}
		</div>
	);
}
