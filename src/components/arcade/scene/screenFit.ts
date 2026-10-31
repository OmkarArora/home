import { type Camera, Vector3 } from "three";

import geometry from "./cabinet-geometry.json";
import { size } from "./screenSize";

/**
 * Pins a flat DOM element onto the cabinet's screen glass: each frame, the
 * glass's four corners are projected to the canvas, and the element (laid out
 * at `size`) gets the CSS `matrix3d` that maps its rectangle onto those four
 * points: a projective transform, so perspective matches exactly.
 *
 * The DOM can't be hidden behind 3D parts, so as the glass turns away from the
 * camera the element fades out (the attract screen drawn on the glass shows
 * instead), and it's gone before the cabinet's sides could cover it. Seen from
 * above, the hood over the screen would hide its top: the element is clipped
 * to below the hood's front edge, as projected this frame.
 */

const { screen } = geometry;
const centre = new Vector3(...(screen.centre as [number, number, number]));
const normal = new Vector3(...(screen.normal as [number, number, number])).normalize();
const right = new Vector3(1, 0, 0);
const up = new Vector3().crossVectors(normal, right).normalize();

/** The glass's corners in the scene: top left, top right, bottom right, bottom left. */
const corners = [
	[-1, 1],
	[1, 1],
	[1, -1],
	[-1, -1],
].map(([x, y]) =>
	centre
		.clone()
		.addScaledVector(right, (x * screen.width) / 2)
		.addScaledVector(up, (y * screen.height) / 2),
);

/** The hood's front edge, along the bottom of the marquee box (measured from the model), a little wider than the glass. */
const hood = [new Vector3(-0.4, 1.597, 0.15), new Vector3(0.4, 1.597, 0.15)];

/** Solves the 8 unknowns of the homography that maps the rectangle's corners to `to`. */
function homography(from: number[][], to: number[][]) {
	const a: number[][] = [];
	for (let i = 0; i < 4; i++) {
		const [x, y] = from[i];
		const [u, v] = to[i];
		a.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
		a.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
	}
	// Gaussian elimination with partial pivoting.
	for (let c = 0; c < 8; c++) {
		let pivot = c;
		for (let r = c + 1; r < 8; r++) if (Math.abs(a[r][c]) > Math.abs(a[pivot][c])) pivot = r;
		[a[c], a[pivot]] = [a[pivot], a[c]];
		for (let r = 0; r < 8; r++) {
			if (r === c) continue;
			const f = a[r][c] / a[c][c];
			for (let k = c; k < 9; k++) a[r][k] -= f * a[c][k];
		}
	}
	const h = a.map((row, i) => row[8] / row[i]);
	return [...h, 1];
}

/** Where a canvas pixel lands on the element: the homography run backwards. */
function unproject(h: number[], [u, v]: number[]) {
	const [a, b, c, d, e, f, g, k, i] = h;
	// The inverse of [[a b c] [d e f] [g k i]], by its adjugate (the determinant cancels out).
	const x = (e * i - f * k) * u + (c * k - b * i) * v + (b * f - c * e);
	const y = (f * g - d * i) * u + (a * i - c * g) * v + (c * d - a * f);
	const w = (d * k - e * g) * u + (b * g - a * k) * v + (a * e - b * d);
	return [x / w, y / w];
}

/** The element's rectangle cut along the line through `a` and `b`, keeping the side the rectangle's bottom middle is on. */
function below(a: number[], b: number[]) {
	const side = ([x, y]: number[]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
	const keep = Math.sign(side([size.w / 2, size.h]));
	const rect = [
		[0, 0],
		[size.w, 0],
		[size.w, size.h],
		[0, size.h],
	];
	if (rect.every((p) => side(p) * keep >= 0)) return null;
	const out: number[][] = [];
	rect.forEach((p, i) => {
		const q = rect[(i + 1) % 4];
		const [sp, sq] = [side(p) * keep, side(q) * keep];
		if (sp >= 0) out.push(p);
		if (sp >= 0 !== sq >= 0) {
			const t = sp / (sp - sq);
			out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
		}
	});
	return out;
}

const point = new Vector3();
const toCamera = new Vector3();

/** How squarely the glass faces the camera: 1 head on, 0 edge on, below 0 from behind. */
function facing(camera: Camera) {
	return toCamera.copy(camera.position).sub(centre).normalize().dot(normal);
}

/** How visible the live screen is from `camera`: 1 head on, fading to 0 as the glass turns away. */
export function liveOpacity(camera: Camera) {
	return Math.min(1, Math.max(0, (facing(camera) - 0.5) / 0.2));
}

/**
 * Fits `el` to the screen as seen by `camera` on a canvas `width`×`height` pixels. Unless
 * `interactive`, clicks go through it to the glass (which takes you up to the cabinet).
 */
export function fitScreen(el: HTMLElement, camera: Camera, width: number, height: number, interactive = true) {
	// The controls and the sway have moved the camera this frame; project from where it is now.
	camera.updateMatrixWorld();
	const opacity = liveOpacity(camera);
	el.style.opacity = String(opacity);
	el.style.pointerEvents = interactive && opacity > 0.5 ? "" : "none";
	if (opacity === 0) {
		el.style.visibility = "hidden";
		return;
	}
	el.style.visibility = "";
	const toCanvas = (c: Vector3) => {
		point.copy(c).project(camera);
		return [((point.x + 1) / 2) * width, ((1 - point.y) / 2) * height];
	};
	const to = corners.map(toCanvas);
	const from = [
		[0, 0],
		[size.w, 0],
		[size.w, size.h],
		[0, size.h],
	];
	const h = homography(from, to);
	const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = h;
	// Hide whatever the hood covers from here.
	const kept = below(...(hood.map((p) => unproject(h, toCanvas(p))) as [number[], number[]]));
	el.style.clipPath = kept ? `polygon(${kept.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})` : "";
	// CSS matrix3d is column-major; the homography's third row goes in the w column.
	el.style.transform = `matrix3d(${h0},${h3},0,${h6},${h1},${h4},0,${h7},0,0,1,0,${h2},${h5},0,${h8})`;
}
