import type { Art, ArtState } from "./Shell";

/**
 * The cabinet as pixel art, like a sprite from an old game: every shape is
 * whole pixels on a 125×225 grid, flat colours with a shade or two, black
 * outlines, and a checkerboard dither on the side panel. Same parts as the
 * illustrated one.
 */

const lime = "#c6f03a";
const limeDeep = "#7fae0f";
const ink = "#050506";

/** One block of pixels. */
const P = ({ x, y, w = 1, h = 1, c }: { x: number; y: number; w?: number; h?: number; c: string }) => <rect x={x} y={y} width={w} height={h} fill={c} />;

/** A filled pixel circle, drawn row by row. */
function Disc({ cx, cy, r, c, shine }: { cx: number; cy: number; r: number; c: string; shine?: string }) {
	const rows = [];
	for (let dy = -r; dy <= r; dy++) {
		const half = Math.round(Math.sqrt(r * r - dy * dy));
		rows.push(<P key={dy} x={cx - half} y={cy + dy} w={half * 2 + 1} c={c} />);
	}
	return (
		<g>
			{rows}
			{shine && <P x={cx - Math.ceil(r / 2)} y={cy - Math.ceil(r / 2)} w={2} c={shine} />}
		</g>
	);
}

/** A round button: a dark rim, the cap, and a pixel of shine; pushed down a pixel when pressed. */
function Push({ x, y, c, down, label }: { x: number; y: number; c: string; down: boolean; label: string }) {
	return (
		<g>
			<Disc cx={x} cy={y + 1} r={5} c={ink} />
			<g transform={`translate(0 ${down ? 1 : 0})`}>
				<Disc cx={x} cy={y} r={4} c={down ? limeDeep : c} shine={down ? undefined : "#ffffff"} />
			</g>
			<text x={x} y={y + 11} textAnchor="middle" fontSize="3.5" fill="#9a9a92">
				{label}
			</text>
		</g>
	);
}

function Draw({ tilt, pressed, title }: ArtState) {
	// The deck widens a pixel each side every 6 rows as it slopes toward you.
	const deck = Array.from({ length: 30 }, (_, r) => {
		const out = Math.floor(r / 6);
		return <P key={r} x={9 - out} y={117 + r} w={107 + out * 2} c={r < 10 ? "#2b2b31" : r < 20 ? "#24242a" : "#1d1d22"} />;
	});

	return (
		<g shapeRendering="crispEdges">
			<defs>
				<pattern id="px-dither" width="2" height="2" patternUnits="userSpaceOnUse">
					<rect width="1" height="1" fill="#1d1d23" />
					<rect x="1" y="1" width="1" height="1" fill="#1d1d23" />
				</pattern>
			</defs>
			{/* Floor shadow. */}
			<P x={6} y={221} w={113} h={2} c="#00000040" />

			{/* Side panel, stepped back at the top, dithered, with a lime stripe. */}
			<P x={2} y={20} w={10} h={198} c="#0b0b0e" />
			<P x={2} y={20} w={10} h={198} c="url(#px-dither)" />
			<P x={4} y={18} w={8} h={2} c="#0b0b0e" />
			<P x={7} y={16} w={5} h={2} c="#0b0b0e" />
			{Array.from({ length: 10 }, (_, i) => (
				<P key={i} x={2 + i} y={88 - i * 2} w={1} h={14} c={lime} />
			))}
			<P x={1} y={20} w={1} h={198} c={ink} />

			{/* Front body, outlined, with lime T-molding. */}
			<P x={12} y={10} w={100} h={211} c="#16161a" />
			<P x={13} y={11} w={2} h={209} c="#1d1d22" />
			<P x={11} y={10} w={1} h={211} c={lime} />
			<P x={112} y={10} w={1} h={211} c={lime} />
			<P x={14} y={6} w={96} h={4} c="#222228" />
			<P x={14} y={5} w={96} h={1} c={ink} />

			{/* Marquee: dark frame, backlit lime panel with a lighter band. */}
			<P x={14} y={12} w={96} h={27} c={ink} />
			<P x={15} y={13} w={94} h={25} c="#33480b" />
			<P x={15} y={19} w={94} h={12} c="#4d6a0c" />
			<text x="62" y="18" textAnchor="middle" fontSize="4" fill="#e6ffa3">
				OMKAR&apos;S
			</text>
			<text x="62.5" y="31" textAnchor="middle" fontSize="11" fill="#1d2a04">
				ARCADE
			</text>
			<text x="62" y="30" textAnchor="middle" fontSize="11" fill="#f6ffd9">
				ARCADE
			</text>
			<text x="62" y="36.5" textAnchor="middle" fontSize="3" fill="#d9f58a">
				{title.toUpperCase()}
			</text>

			{/* Speaker grille. */}
			{Array.from({ length: 22 }, (_, i) => (
				<P key={i} x={18 + i * 4} y={41} w={2} h={2} c={ink} />
			))}

			{/* Bezel, its lime frame and small print. */}
			<P x={16} y={45} w={93} h={72} c={ink} />
			<P x={19} y={47} w={87} h={1} c={limeDeep} />
			<P x={19} y={111} w={87} h={1} c={limeDeep} />
			<P x={19} y={47} w={1} h={65} c={limeDeep} />
			<P x={105} y={47} w={1} h={65} c={limeDeep} />
			<text x="21" y="115.5" fontSize="3" fill={lime}>
				1P
			</text>
			<text x="104" y="115.5" fontSize="3" fill={lime} textAnchor="end">
				INSERT COIN
			</text>

			{/* Control deck, its lime lip and front face. */}
			<P x={9} y={116} w={107} h={1} c={lime} />
			{deck}
			<P x={4} y={147} w={117} h={1} c={lime} />
			<P x={4} y={148} w={117} h={7} c="#0e0e11" />

			{/* Joystick: base, shaft (leaning in two steps) and ball. */}
			<P x={26} y={134} w={13} h={3} c={ink} />
			<P x={31 + tilt} y={129} w={2} h={6} c="#b9b9b2" />
			<P x={31 + tilt * 2} y={125} w={2} h={4} c="#b9b9b2" />
			<Disc cx={32 + tilt * 3} cy={121} r={4} c={lime} shine="#f2ffc4" />
			<text x="32" y="143" textAnchor="middle" fontSize="3.5" fill="#9a9a92">
				◀ ▶
			</text>

			<Push x={66} y={131} c={lime} down={pressed === "prev"} label="◀" />
			<Push x={81} y={129} c={lime} down={pressed === "next"} label="▶" />
			<Push x={100} y={127} c="#e9e9e2" down={pressed === "start"} label="START" />

			{/* Coin door: lit slots, coin returns, bolts. */}
			<P x={45} y={165} w={35} h={36} c="#3a3a42" />
			<P x={46} y={166} w={33} h={34} c="#26262c" />
			{[51, 66].map((x) => (
				<g key={x}>
					<P x={x} y={170} w={8} h={14} c={ink} />
					<P x={x + 1} y={171} w={6} h={7} c={pressed === "coin" ? "#f6ffd9" : lime} />
					<P x={x + 3} y={172} w={2} h={5} c={ink} />
					<text x={x + 4} y={182.5} textAnchor="middle" fontSize="3" fill={lime}>
						25¢
					</text>
					<P x={x + 1} y={189} w={6} h={4} c={ink} />
				</g>
			))}
			{[
				[47, 167],
				[77, 167],
				[47, 198],
				[77, 198],
			].map(([x, y]) => (
				<P key={`${x}-${y}`} x={x} y={y} c="#55555d" />
			))}

			{/* Kick plate. */}
			<P x={12} y={211} w={100} h={10} c="#09090a" />
			<P x={12} y={211} w={100} h={1} c={limeDeep} />
		</g>
	);
}

export const pixelArt: Art = {
	width: 125,
	height: 225,
	screen: { x: 22, y: 49, w: 81, h: 61 },
	stick: { x: 23, y: 115, w: 19, h: 24 },
	hits: {
		prev: { x: 60, y: 125, w: 13, h: 13 },
		next: { x: 75, y: 123, w: 13, h: 13 },
		start: { x: 94, y: 121, w: 13, h: 13 },
		coin: { x: 49, y: 168, w: 28, h: 18 },
	},
	Draw,
};
