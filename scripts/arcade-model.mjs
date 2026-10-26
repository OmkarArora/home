/**
 * Builds the Arcade's 3D cabinet from JewelPodd's "Arcade Cabinet" (Sketchfab,
 * CC BY 4.0), which comes as one untextured mesh of 79 loose pieces.
 *
 * - Stands it on the floor, 1.8 m tall, facing +z.
 * - Splits the mesh into its pieces and sorts them into named parts (body,
 *   screen, marquee, buttons, joysticks, coin door…), each its own node with
 *   its own material, so the scene can colour, light and click them.
 * - Writes where the screen is to `cabinet-geometry.json`, which places the
 *   live screen in the scene.
 * - Welds, quantizes and meshopt-compresses the result.
 *
 * Usage: pnpm arcade:model [--inspect]
 * Source: scratch/models/jewelpodd-arcade_cabinet/scene.gltf (local only, not committed).
 * Output: public/models/arcade-cabinet.glb, src/components/arcade/scene/cabinet-geometry.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { Document, NodeIO } from "@gltf-transform/core";
import { EXTMeshoptCompression, KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, flatten, prune, quantize, reorder, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";

const source = "scratch/models/jewelpodd-arcade_cabinet/scene.gltf";
const output = "public/models/arcade-cabinet.glb";
const geometryOut = "src/components/arcade/scene/cabinet-geometry.json";
const inspect = process.argv.includes("--inspect");

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ "meshopt.encoder": MeshoptEncoder });

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(...a);
const norm = (a) => a.map((v) => v / (len(a) || 1));
const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;
const faceNormal = (t) => norm(cross(sub(t.p[1], t.p[0]), sub(t.p[2], t.p[0])));

/** Every triangle in world space: `p` its corners, `n` their normals. */
async function readTriangles() {
	const doc = await io.read(source);
	await doc.transform(flatten());
	const tris = [];
	for (const node of doc.getRoot().listNodes()) {
		const mesh = node.getMesh();
		if (!mesh) continue;
		const m = node.getWorldMatrix();
		const point = ([x, y, z]) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
		// The transform is a rotation and a uniform scale, so normals turn with the same matrix.
		const turn = ([x, y, z]) => norm([m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z]);
		for (const prim of mesh.listPrimitives()) {
			const pos = prim.getAttribute("POSITION");
			const nor = prim.getAttribute("NORMAL");
			const idx = prim.getIndices();
			const count = idx ? idx.getCount() : pos.getCount();
			const at = (i) => (idx ? idx.getScalar(i) : i);
			for (let i = 0; i < count; i += 3) {
				const v = [at(i), at(i + 1), at(i + 2)];
				const t = { p: v.map((j) => point(pos.getElement(j, []))) };
				t.n = v.map((j) => (nor ? turn(nor.getElement(j, [])) : faceNormal(t)));
				tris.push(t);
			}
		}
	}
	return tris;
}

/** Stand it on the floor at the origin, a real cabinet's 1.8 m tall. */
function normalise(tris) {
	const min = [Infinity, Infinity, Infinity];
	const max = [-Infinity, -Infinity, -Infinity];
	for (const t of tris) for (const v of t.p) for (let k = 0; k < 3; k++) (min[k] = Math.min(min[k], v[k])), (max[k] = Math.max(max[k], v[k]));
	const scale = 1.8 / (max[1] - min[1]);
	const at = [(min[0] + max[0]) / 2, min[1], (min[2] + max[2]) / 2];
	return tris.map((t) => ({ ...t, p: t.p.map((v) => v.map((c, k) => (c - at[k]) * scale)) }));
}

/** Groups triangles into the pieces they make, by shared corners. */
function pieces(tris) {
	const ids = new Map();
	const id = (v) => {
		const key = v.map((c) => c.toFixed(5)).join();
		if (!ids.has(key)) ids.set(key, ids.size);
		return ids.get(key);
	};
	const vid = tris.map((t) => t.p.map(id));
	const parent = Array.from({ length: ids.size }, (_, i) => i);
	const find = (x) => {
		while (parent[x] !== x) x = parent[x] = parent[parent[x]];
		return x;
	};
	for (const [a, b, c] of vid) {
		parent[find(b)] = find(a);
		parent[find(c)] = find(a);
	}
	const groups = new Map();
	tris.forEach((t, i) => {
		const root = find(vid[i][0]);
		if (!groups.has(root)) groups.set(root, []);
		groups.get(root).push(t);
	});
	return [...groups.values()].map((list) => {
		const min = [Infinity, Infinity, Infinity];
		const max = [-Infinity, -Infinity, -Infinity];
		for (const t of list) for (const v of t.p) for (let k = 0; k < 3; k++) (min[k] = Math.min(min[k], v[k])), (max[k] = Math.max(max[k], v[k]));
		const size = sub(max, min);
		return { tris: list, min, max, size, centre: min.map((v, k) => (v + max[k]) / 2), volume: size[0] * size[1] * size[2] };
	});
}

const tris = normalise(await readTriangles());
const all = pieces(tris).sort((a, b) => b.tris.length - a.tris.length);

if (inspect) {
	console.log(`${tris.length} triangles, ${all.length} pieces`);
	for (const p of all) console.log(`${String(p.tris.length).padStart(5)} tris  size ${p.size.map((v) => round(v)).join(" × ")}  centre ${p.centre.map((v) => round(v)).join(", ")}`);
	process.exit(0);
}

/**
 * Which part a piece is, from its size and place. Measured from the model
 * (`--inspect`): the controls sit at y≈1.08–1.15 at the front, the coin door
 * low on the front, the vents on the back (z < -0.37). Player 1 is on the left (x < 0).
 */
function classify(p, body) {
	const [w, h] = p.size;
	const [x, y, z] = p.centre;
	const side = x < 0 ? "p1" : "p2";
	if (p === body) return "body";
	if (h > 1.7 && w < 0.05) return "sides";
	if (w > 0.7 && h < 0.15 && y > 1) return "deck";
	if (w > 0.5 && h > 0.3 && y > 1.2 && y < 1.4) return "screen";
	if (z < -0.37) return "back";
	if (y > 1.45) return "speakers";
	if (y > 1.05 && y < 1.2 && z > 0.12) {
		if (w > 0.04 && w < 0.045 && h > 0.035) return `${side}-stick`;
		if (h > 0.04) return "stick-shafts";
		if (w > 0.045) return "stick-bases";
		// The start buttons sit further back on the deck, one per player.
		if (z < 0.18) return w < 0.037 ? `${side}-start` : "button-rings";
		return w < 0.035 ? "button-cap" : "button-rings";
	}
	if (z > 0.15 && y < 0.8) {
		if (w > 0.2) return "coin-door";
		if (w < 0.035) return "coin-locks";
		return y > 0.6 ? "coin-slots" : "coin-returns";
	}
	return "trim";
}

const body = all.reduce((a, b) => (a.volume > b.volume ? a : b));
const parts = new Map();
const add = (name, list) => parts.set(name, [...(parts.get(name) ?? []), ...list]);

// Each player's six buttons, numbered back row then front row, left to right.
const caps = { p1: [], p2: [] };
for (const p of all) {
	const name = classify(p, body);
	if (name === "button-cap") caps[p.centre[0] < 0 ? "p1" : "p2"].push(p);
	else add(name, p.tris);
}
for (const [side, list] of Object.entries(caps)) {
	list.sort((a, b) => Math.round((a.centre[2] - b.centre[2]) * 20) || a.centre[0] - b.centre[0]);
	list.forEach((p, i) => add(`${side}-button-${i + 1}`, p.tris));
}

// The marquee: the body's front face above the speakers.
const isMarquee = (t) => faceNormal(t)[2] > 0.95 && t.p.every((v) => v[1] > 1.59);
parts.set("body", parts.get("body").filter((t) => !isMarquee(t)));
add("marquee", body.tris.filter(isMarquee));

// Where the screen's glass is. The tube is curved, so its facing is the area-weighted average
// of the faces that look forward, and the live screen goes just in front of its bulge.
const screenTris = parts.get("screen");
const area = (t) => len(cross(sub(t.p[1], t.p[0]), sub(t.p[2], t.p[0]))) / 2;
const forward = screenTris.filter((t) => faceNormal(t)[2] > 0.75);
const facing = norm(forward.reduce((a, t) => a.map((c, k) => c + faceNormal(t)[k] * area(t)), [0, 0, 0]));
const glass = screenTris.filter((t) => dot(faceNormal(t), facing) > 0.9);
const up = norm(cross(facing, [1, 0, 0])).map((v) => -v);
const corners = glass.flatMap((t) => t.p);
const spread = (axis) => {
	const values = corners.map((v) => dot(v, axis));
	return [Math.min(...values), Math.max(...values)];
};
const [[x0, x1], [u0, u1], [, out]] = [spread([1, 0, 0]), spread(up), spread(facing)];
const mid = corners.reduce((a, v) => a.map((c, k) => c + v[k] / corners.length), [0, 0, 0]);
// Slide the middle to the box's centre in-plane, and forward to the front of the bulge.
const shift = (x0 + x1) / 2 - mid[0];
const lift = (u0 + u1) / 2 - dot(mid, up);
const push = out - dot(mid, facing) + 0.002;
const centre = mid.map((c, k) => c + [1, 0, 0][k] * shift + up[k] * lift + facing[k] * push);
const width = x1 - x0;
const height = u1 - u0;
const screen = {
	centre: centre.map((v) => round(v, 4)),
	normal: facing.map((v) => round(v, 4)),
	// The screen leans back: the rotation about x, in radians, that turns +z to face along `normal`.
	tilt: round(-Math.atan2(facing[1], facing[2]), 4),
	width: round(width, 4),
	height: round(height, 4),
};

// The new model: one node and material per part.
const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene("Arcade cabinet");
const counts = [];
for (const [name, list] of [...parts].sort()) {
	const accessor = (array) => doc.createAccessor().setType("VEC3").setArray(new Float32Array(array)).setBuffer(buffer);
	const prim = doc
		.createPrimitive()
		.setAttribute("POSITION", accessor(list.flatMap((t) => t.p.flat())))
		.setAttribute("NORMAL", accessor(list.flatMap((t) => t.n.flat())))
		.setMaterial(doc.createMaterial(name).setBaseColorFactor([0.5, 0.5, 0.5, 1]).setRoughnessFactor(0.6));
	// The marquee and the screen carry pictures (the sign, the attract screen), so they get
	// texture coordinates: flat, front on.
	if (name === "marquee" || name === "screen") {
		const xs = list.flatMap((t) => t.p.map((v) => v[0]));
		const ys = list.flatMap((t) => t.p.map((v) => v[1]));
		const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
		const uv = list.flatMap((t) => t.p.flatMap((v) => [(v[0] - x0) / (x1 - x0), 1 - (v[1] - y0) / (y1 - y0)]));
		prim.setAttribute("TEXCOORD_0", doc.createAccessor().setType("VEC2").setArray(new Float32Array(uv)).setBuffer(buffer));
	}
	scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
	counts.push([name, list.length]);
}
// Keep the marquee's texture coordinates: no material here uses a texture yet (the scene adds its sign), so prune would drop them.
await doc.transform(weld(), dedup(), reorder({ encoder: MeshoptEncoder }), quantize(), prune({ keepAttributes: true }));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });

mkdirSync(dirname(output), { recursive: true });
mkdirSync(dirname(geometryOut), { recursive: true });
const glb = await io.writeBinary(doc);
writeFileSync(output, glb);
writeFileSync(geometryOut, `${JSON.stringify({ height: 1.8, screen }, null, "\t")}\n`);

console.log("Parts:");
for (const [name, n] of counts) console.log(`  ${name.padEnd(16)} ${n} tris`);
console.log(`\nScreen: ${JSON.stringify(screen)}`);
console.log(`Wrote ${output} (${Math.round(glb.byteLength / 1024)} KB) and ${geometryOut}`);
