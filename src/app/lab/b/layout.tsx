import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

const serif = Instrument_Serif({
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	variable: "--lab-serif",
});
const grotesk = Archivo({
	subsets: ["latin"],
	variable: "--lab-grotesk",
	axes: ["wdth"],
});
const mono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--lab-mono",
});

/** Version B's palette: warm paper, near-black ink, one vermilion. */
const palette = `
[data-lab="b"] {
	--bg: #faf8f4; --ink: #121212; --muted: #6f6a62; --line: rgb(18 18 18 / 0.16);
	--accent: #d9441c;
}
.dark [data-lab="b"] {
	--bg: #121212; --ink: #eee9e0; --muted: #9a948a; --line: rgb(238 233 224 / 0.16);
	--accent: #ff6b40;
}
`;

export default function LabBLayout({ children }: { children: React.ReactNode }) {
	return (
		<div
			data-lab="b"
			className={`${serif.variable} ${grotesk.variable} ${mono.variable} min-h-screen bg-[var(--bg)] text-[var(--ink)] [font-family:var(--lab-serif)]`}
		>
			<style>{palette}</style>
			{children}
		</div>
	);
}
