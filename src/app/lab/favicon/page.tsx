import type { Metadata } from "next";

import { favicons } from "@/components/lab/favicons";

export const metadata: Metadata = { title: "Favicon options" };

const src = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** A browser's tab strip, roughly Chrome's, in its light or dark colours. */
function Tabs({ dark, icon }: { dark: boolean; icon: string }) {
	const strip = dark ? "#202124" : "#dee1e6";
	const tab = dark ? "#35363a" : "#ffffff";
	const text = dark ? "#e8eaed" : "#202124";
	const others = ["GitHub", "Gmail", "YouTube"];
	return (
		<div style={{ background: strip, colorScheme: dark ? "dark" : "light" }} className="flex gap-1 overflow-hidden rounded-t-lg px-2 pt-2">
			<div style={{ background: tab, color: text }} className="flex w-52 shrink-0 items-center gap-2 rounded-t-lg px-3 py-2 text-[13px]">
				{/* The real size: 16 CSS pixels. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={icon} width={16} height={16} alt="" />
				<span className="truncate">Omkar Arora</span>
			</div>
			{others.map((name) => (
				<div key={name} style={{ color: text }} className="flex w-40 items-center gap-2 px-3 py-2 text-[13px] opacity-70">
					<span className="inline-block size-4 rounded-full bg-current opacity-40" />
					{name}
				</div>
			))}
		</div>
	);
}

/**
 * Favicon candidates, side by side, the way they will actually be seen: in a
 * tab at 16px, light and dark, and as a home-screen icon.
 */
export default function FaviconLab() {
	return (
		<main className="mx-auto w-full max-w-5xl space-y-16 px-5 py-14 font-sans">
			<header>
				<p className="font-mono text-xs uppercase tracking-widest opacity-60">Lab · favicon</p>
				<h1 className="mt-3 text-4xl font-bold tracking-tight">Pick a favicon</h1>
				<p className="mt-3 max-w-xl opacity-70">
					Each option at its real size in a tab, on light and dark browser chrome. The Reticle follows
					the system theme, so its dark-tab colour only shows when your OS is in dark mode.
				</p>
			</header>
			{favicons.map((icon, index) => (
				<section key={icon.key} className="space-y-4">
					<h2 className="text-2xl font-bold">
						{index + 1}. {icon.name}
					</h2>
					<p className="max-w-xl opacity-70">{icon.note}</p>
					<div className="space-y-3">
						<Tabs dark={false} icon={src(icon.svg)} />
						<Tabs dark icon={src(icon.svg)} />
					</div>
					<div className="flex flex-wrap items-end gap-6">
						{[16, 32, 64, 180].map((size) => (
							<figure key={size} className="text-center">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={src(icon.svg)} width={size} height={size} alt={`${icon.name} at ${size}px`} />
								<figcaption className="mt-2 font-mono text-xs opacity-60">{size}px</figcaption>
							</figure>
						))}
					</div>
				</section>
			))}
		</main>
	);
}
