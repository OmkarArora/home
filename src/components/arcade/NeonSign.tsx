import { mono } from "@/components/site/ui";

/**
 * A lime neon sign on a dark plate: layered glows around a pale core. One
 * letter's tube stutters now and then (see `.neon-stutter` in globals.css).
 */
const glow = "0 0 2px #f6ffd9, 0 0 6px #c6f03a, 0 0 14px #c6f03a, 0 0 28px #9fd11a, 0 0 48px #7fae0f";

export function NeonSign({ text, broken = 1, className = "" }: { text: string; /** Which letter's tube stutters. */ broken?: number; className?: string }) {
	return (
		<span aria-label={text} role="img" className={`${mono} neon-hum inline-flex font-bold uppercase text-[#f6ffd9] ${className}`} style={{ textShadow: glow }}>
			{[...text].map((letter, i) => (
				<span key={i} aria-hidden className={i === broken ? "neon-stutter" : undefined}>
					{letter === " " ? " " : letter}
				</span>
			))}
		</span>
	);
}
