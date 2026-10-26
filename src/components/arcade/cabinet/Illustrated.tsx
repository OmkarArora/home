import type { Art, ArtState } from "./Shell";

/**
 * The cabinet as a vector illustration, seen a little from the left: a side
 * panel with art, lime T-molding, a backlit marquee, the bezel, a control
 * deck that juts out with a ball-top joystick and three buttons, and a coin
 * door with lit slots. Drawn on a 500×900 grid.
 */

const lime = "#c6f03a";
const limeDeep = "#7fae0f";
const body = "#141417";

function Defs() {
	return (
		<defs>
			<linearGradient id="il-front" x1="0" x2="1">
				<stop offset="0" stopColor="#1d1d22" />
				<stop offset="1" stopColor="#111114" />
			</linearGradient>
			<linearGradient id="il-side" x1="0" x2="1">
				<stop offset="0" stopColor="#0a0a0c" />
				<stop offset="1" stopColor="#1a1a1f" />
			</linearGradient>
			<linearGradient id="il-marquee" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2c3a0a" />
				<stop offset="0.5" stopColor="#4d6a0c" />
				<stop offset="1" stopColor="#24300a" />
			</linearGradient>
			<linearGradient id="il-deck" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2b2b31" />
				<stop offset="1" stopColor="#1a1a1e" />
			</linearGradient>
			<radialGradient id="il-ball" cx="0.35" cy="0.3" r="0.75">
				<stop offset="0" stopColor="#f2ffc4" />
				<stop offset="0.35" stopColor={lime} />
				<stop offset="1" stopColor={limeDeep} />
			</radialGradient>
			<radialGradient id="il-button" cx="0.4" cy="0.35" r="0.7">
				<stop offset="0" stopColor="#efffb8" />
				<stop offset="0.5" stopColor={lime} />
				<stop offset="1" stopColor="#6d9a0c" />
			</radialGradient>
			<radialGradient id="il-start" cx="0.4" cy="0.35" r="0.7">
				<stop offset="0" stopColor="#ffffff" />
				<stop offset="0.6" stopColor="#e9e9e2" />
				<stop offset="1" stopColor="#9d9d95" />
			</radialGradient>
			<filter id="il-glow" x="-30%" y="-60%" width="160%" height="220%">
				<feGaussianBlur stdDeviation="4" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<pattern id="il-grille" width="8" height="8" patternUnits="userSpaceOnUse">
				<circle cx="4" cy="4" r="1.6" fill="#050506" />
			</pattern>
		</defs>
	);
}

/** A round arcade button, pushed in when `down`. */
function Push({ x, y, fill, down, label }: { x: number; y: number; fill: string; down: boolean; label: string }) {
	return (
		<g>
			<ellipse cx={x} cy={y + 9} rx="21" ry="11" fill="#050506" />
			<g style={{ transform: `translateY(${down ? 5 : 0}px)`, transition: "transform 90ms" }}>
				<ellipse cx={x} cy={y + 5} rx="18" ry="9" fill="#00000088" />
				<ellipse cx={x} cy={y} rx="18" ry="10" fill={fill} />
				<ellipse cx={x - 5} cy={y - 3} rx="6" ry="2.5" fill="#ffffff66" />
			</g>
			<text x={x} y={y + 40} textAnchor="middle" fontSize="8" fill="#9a9a92">
				{label}
			</text>
		</g>
	);
}

function Draw({ tilt, pressed, title }: ArtState) {
	return (
		<>
			<Defs />
			{/* Shadow on the floor. */}
			<ellipse cx="250" cy="888" rx="240" ry="10" fill="#00000040" />

			{/* The side panel, seen at an angle, with its art. */}
			<polygon points="6,70 50,40 50,880 6,868" fill="url(#il-side)" />
			<polygon points="6,300 50,250 50,330 6,380" fill={lime} opacity="0.85" />
			<polygon points="6,400 50,350 50,372 6,422" fill={lime} opacity="0.5" />
			<polygon points="6,70 50,40 50,46 6,76" fill={lime} />

			{/* The front. */}
			<rect x="50" y="40" width="400" height="840" fill="url(#il-front)" />
			{/* T-molding down both edges. */}
			<rect x="47" y="40" width="6" height="840" rx="3" fill={lime} />
			<rect x="447" y="40" width="6" height="840" rx="3" fill={lime} />
			{/* The cap. */}
			<polygon points="44,40 456,40 440,24 60,24" fill="#222228" />

			{/* Marquee: a backlit panel. */}
			<rect x="60" y="48" width="380" height="104" rx="4" fill="#050506" />
			<rect x="66" y="54" width="368" height="92" rx="3" fill="url(#il-marquee)" />
			<rect x="66" y="54" width="368" height="92" rx="3" fill="none" stroke={lime} strokeOpacity="0.35" />
			<text x="250" y="76" textAnchor="middle" fontSize="9" fill="#e6ffa3" letterSpacing="3">
				OMKAR&apos;S
			</text>
			<text x="250" y="122" textAnchor="middle" fontSize="34" fill="#f6ffd9" letterSpacing="4" filter="url(#il-glow)">
				ARCADE
			</text>
			<text x="250" y="140" textAnchor="middle" fontSize="7" fill="#d9f58a" letterSpacing="2">
				{title.toUpperCase()}
			</text>

			{/* Speaker grille. */}
			<rect x="70" y="158" width="360" height="16" fill="url(#il-grille)" />

			{/* Bezel round the screen, with its small print. */}
			<rect x="66" y="180" width="368" height="274" rx="10" fill="#050506" />
			<rect x="74" y="186" width="352" height="262" rx="8" fill="none" stroke={lime} strokeOpacity="0.4" strokeWidth="1.5" />
			<text x="86" y="444" fontSize="7" fill={lime} opacity="0.8">
				1 PLAYER
			</text>
			<text x="414" y="444" fontSize="7" fill={lime} opacity="0.8" textAnchor="end">
				INSERT COIN
			</text>

			{/* Control deck: juts out, slopes toward you. */}
			<polygon points="36,458 464,458 482,588 18,588" fill="url(#il-deck)" />
			<rect x="18" y="588" width="464" height="30" fill="#0e0e11" />
			<rect x="18" y="586" width="464" height="5" rx="2" fill={lime} />
			<polyline points="36,458 464,458" stroke={lime} strokeWidth="3" />

			{/* Joystick: a base, the shaft and the ball, leaning with the stick. */}
			<ellipse cx="130" cy="530" rx="30" ry="11" fill="#050506" />
			<g style={{ transform: `rotate(${tilt * 18}deg)`, transformOrigin: "130px 530px", transition: "transform 120ms" }}>
				<rect x="126" y="490" width="8" height="40" rx="3" fill="#b9b9b2" />
				<circle cx="130" cy="484" r="17" fill="url(#il-ball)" />
			</g>
			<text x="130" y="572" textAnchor="middle" fontSize="8" fill="#9a9a92">
				◀ ▶
			</text>

			<Push x={265} y={528} fill="url(#il-button)" down={pressed === "prev"} label="◀" />
			<Push x={325} y={518} fill="url(#il-button)" down={pressed === "next"} label="▶" />
			<Push x={400} y={510} fill="url(#il-start)" down={pressed === "start"} label="START" />

			{/* Coin door: two lit slots, coin returns, bolts. */}
			<rect x="180" y="660" width="140" height="140" rx="5" fill="#26262c" stroke="#3a3a42" strokeWidth="2" />
			{[205, 263].map((x) => (
				<g key={x}>
					<rect x={x} y="682" width="32" height="54" rx="3" fill="#0a0a0b" />
					<rect x={x + 6} y="688" width="20" height="26" rx="2" fill={pressed === "coin" ? "#f6ffd9" : lime} opacity={pressed === "coin" ? 1 : 0.85} />
					<rect x={x + 14} y="692" width="4" height="18" rx="1" fill="#0a0a0b" />
					<text x={x + 16} y="729" textAnchor="middle" fontSize="7" fill={lime}>
						25¢
					</text>
					<rect x={x + 6} y="748" width="20" height="14" rx="2" fill="#0a0a0b" />
				</g>
			))}
			{[
				[188, 668],
				[312, 668],
				[188, 792],
				[312, 792],
			].map(([x, y]) => (
				<circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#55555d" />
			))}

			{/* Kick plate. */}
			<rect x="50" y="846" width="400" height="34" fill="#09090a" />
			<rect x="50" y="846" width="400" height="3" fill={lime} opacity="0.6" />
			<rect x="50" y="40" width="400" height="840" fill="none" stroke={body} strokeWidth="1" />
		</>
	);
}

export const illustrated: Art = {
	width: 500,
	height: 900,
	screen: { x: 92, y: 196, w: 316, h: 237 },
	hits: {
		prev: { x: 240, y: 505, w: 50, h: 46 },
		next: { x: 300, y: 495, w: 50, h: 46 },
		start: { x: 375, y: 487, w: 50, h: 46 },
		coin: { x: 200, y: 676, w: 100, h: 66 },
	},
	Draw,
};
