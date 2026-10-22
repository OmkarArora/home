/**
 * Favicon candidates for version A, as SVG source. The lab page at
 * /lab/favicon shows each one in mock browser tabs at real size; the chosen
 * one is copied to `src/app/icon.svg`.
 *
 * All are drawn with shapes, never text: a favicon can't rely on fonts.
 */

const INK = "#0c0c0d";
const LIME = "#c6f03a";

export type Favicon = { key: string; name: string; note: string; svg: string };

export const favicons: Favicon[] = [
	{
		key: "ring",
		name: "Lime O",
		note: "The lime square from the wordmark, holding a thick O. Reads at 16px on any tab colour.",
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${LIME}"/><circle cx="16" cy="16" r="8.25" fill="none" stroke="${INK}" stroke-width="5"/></svg>`,
	},
	{
		key: "pixel",
		name: "Pixel OA",
		note: "Your initials in a 3×5 pixel font, lime on ink: the patch-notes, game-y side of A.",
		svg: (() => {
			// 3×5 glyphs, one cell per pixel; a gap column between the letters.
			const O = ["111", "101", "101", "101", "111"];
			const A = ["010", "101", "111", "101", "101"];
			const size = 3.6;
			const x0 = (32 - 7 * size) / 2;
			const y0 = (32 - 5 * size) / 2;
			const cells: string[] = [];
			[O, A].forEach((glyph, letter) =>
				glyph.forEach((row, y) =>
					[...row].forEach((on, x) => {
						if (on === "1") {
							const px = x0 + (x + letter * 4) * size;
							cells.push(`<rect x="${px.toFixed(2)}" y="${(y0 + y * size).toFixed(2)}" width="${size}" height="${size}"/>`);
						}
					}),
				),
			);
			return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${INK}"/><g fill="${LIME}" shape-rendering="crispEdges">${cells.join("")}</g></svg>`;
		})(),
	},
	{
		key: "reticle",
		name: "Reticle",
		note: "The aiming reticle from the site's cursor. No tile: ink on light tabs, lime on dark ones.",
		svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><style>g{stroke:${INK};fill:${INK}}@media (prefers-color-scheme:dark){g{stroke:${LIME};fill:${LIME}}}</style><g stroke-width="3"><circle cx="16" cy="16" r="10" fill="none"/><path d="M16 0v7M16 25v7M0 16h7M25 16h7" fill="none"/><circle cx="16" cy="16" r="2.5" stroke="none"/></g></svg>`,
	},
];
