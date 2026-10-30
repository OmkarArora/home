/**
 * Prepares the Arcade room's props, all from Sketchfab (CC BY 4.0, credited
 * on the page): a record player, a CRT TV and a PlayStation. They come with
 * 4K PNG textures (25–75 MB each), far too heavy for a prop in the corner.
 *
 * For each: paint out brand marks and borrowed artwork (`paintOut`), scale
 * to its real size, stand it on the floor centred, shrink the textures to
 * 1024 px WebP, and weld, quantize and meshopt-compress the geometry.
 *
 * Usage: pnpm arcade:props
 * Sources: scratch/models/<name>/scene.gltf (local only, not committed).
 * Output: public/models/<out>.glb
 */

import { statSync, writeFileSync } from "node:fs";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, flatten, getBounds, prune, quantize, reorder, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

/**
 * Brand marks and other people's artwork to paint out, per texture set (the colour, roughness and
 * normal maps of a material share a layout, so each patch is applied to all three). Rectangles are
 * [left, top, right, bottom] in the 4096 px source. `fill` paints the rectangle in the colour round
 * its edge; `copy` covers it with the same-size patch `from` [dx, dy] away (for textured surfaces,
 * like the felt mat, where a flat fill would show).
 */
const paintOut = {
	crt_front: [
		{ fill: [595, 1200, 660, 1430] }, // SONY, on the bezel
		{ fill: [2005, 2005, 2065, 2185] }, // Trinitron
	],
	crt_back: [{ fill: [2392, 726, 2814, 1496] }], // the rating label (SONY, Trinitron, all over it)
	"Material.001": [
		{ fill: [1100, 3535, 1215, 3735] }, // SONY, on the lid
		{ fill: [1550, 3375, 1745, 3620] }, // the PlayStation logo and wordmark
		{ fill: [2562, 466, 2726, 694] }, // stickers: Spyro,
		{ fill: [2702, 466, 2826, 566] }, // DOOM,
		{ fill: [2610, 702, 2786, 878] }, // NASA,
		{ fill: [2734, 878, 2922, 1058] }, // Spider-Man
	],
	RPL0002_Textures: [
		{ fill: [3550, 580, 3885, 685] }, // YAMAHA, on the deck
		{ fill: [2950, 2340, 3015, 3420] }, // YAMAHA NATURAL SOUND STEREO TURNTABLE TT-300
		{ fill: [1240, 3585, 1560, 3650] }, // the YAMAHA rating plate
		{ copy: [1363, 2857, 1660, 3099], from: [300, 30] }, // RCA, on the mat
	],
};

/** Paints the marks out of one texture image (PNG or JPEG bytes), returning PNG bytes. */
async function paint(bytes, patches) {
	const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width, height, channels } = info;
	const k = width / 4096;
	const at = (x, y) => (Math.min(height - 1, Math.max(0, y)) * width + Math.min(width - 1, Math.max(0, x))) * channels;
	for (const patch of patches) {
		const [l, t, r, b] = (patch.fill ?? patch.copy).map((v) => Math.round(v * k));
		if (patch.fill) {
			// The colour round the rectangle: the median of a ring of pixels just outside it.
			const ring = [];
			for (let x = l - 4; x <= r + 4; x += 2) for (const y of [t - 4, b + 4]) ring.push(at(x, y));
			for (let y = t - 4; y <= b + 4; y += 2) for (const x of [l - 4, r + 4]) ring.push(at(x, y));
			const colour = [0, 1, 2, 3].map((c) => ring.map((i) => data[i + c]).sort((p, q) => p - q)[ring.length >> 1]);
			for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) colour.forEach((v, c) => (data[at(x, y) + c] = v));
		} else {
			const [dx, dy] = patch.from.map((v) => Math.round(v * k));
			for (let y = t; y <= b; y++) for (let x = l; x <= r; x++) for (let c = 0; c < channels; c++) data[at(x, y) + c] = data[at(x + dx, y + dy) + c];
		}
	}
	return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

const props = [
	// How big each really is, along one axis (metres), to scale it to.
	{ source: "yamaha_tt-300_record_player", out: "record-player", axis: 0, size: 0.43 },
	{ source: "sony_pvm-14l2_crt_tv", out: "crt-tv", axis: 1, size: 0.34 },
	{ source: "sony_playstation_one", out: "playstation", axis: 2, size: 0.193 },
	// The easter egg: Shenlong (rigged, with his idle animation) and the seven balls. Sized in the
	// scene, so here just a unit length; Shenlong's own pile of dragon balls is left out.
	{ source: "dragon_ball_z_shenlong", out: "shenlong", axis: 2, size: 1, drop: ["dragonballs_DRAGONBALL_0"] },
	{ source: "the_dragon_balls", out: "dragon-balls", axis: 0, size: 1 },
];

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });

for (const prop of props) {
	const from = `scratch/models/${prop.source}/scene.gltf`;
	const doc = await io.read(from);
	const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];

	// Real size, on the floor, centred: one parent node carries the scale and offset.
	const { min, max } = getBounds(scene);
	const scale = prop.size / (max[prop.axis] - min[prop.axis]);
	const root = doc.createNode(prop.out).setScale([scale, scale, scale]).setTranslation([-((min[0] + max[0]) / 2) * scale, -min[1] * scale, -((min[2] + max[2]) / 2) * scale]);
	for (const child of scene.listChildren()) {
		scene.removeChild(child);
		root.addChild(child);
	}
	scene.addChild(root);

	for (const node of doc.getRoot().listNodes()) if (prop.drop?.includes(node.getName())) node.dispose();

	// Brand marks and borrowed artwork out, before the textures are shrunk.
	for (const texture of doc.getRoot().listTextures()) {
		const name = (texture.getURI() || texture.getName()).split("/").pop() ?? "";
		const set = Object.keys(paintOut).find((prefix) => name.startsWith(`${prefix}_`));
		if (!set) continue;
		texture.setImage(new Uint8Array(await paint(texture.getImage(), paintOut[set]))).setMimeType("image/png");
		console.log(`  painted out ${paintOut[set].length} mark(s) in ${name}`);
	}

	await doc.transform(
		flatten(),
		dedup(),
		prune(),
		weld(),
		textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 82 }),
		reorder({ encoder: MeshoptEncoder }),
		quantize(),
	);
	doc.createExtension(ALL_EXTENSIONS.find((e) => e.EXTENSION_NAME === "EXT_meshopt_compression"))
		.setRequired(true)
		.setEncoderOptions({ method: "filter" });

	const glb = await io.writeBinary(doc);
	const out = `public/models/${prop.out}.glb`;
	writeFileSync(out, glb);
	const before = statSync(`scratch/models/${prop.source}/scene.bin`).size;
	const materials = doc.getRoot().listMaterials().map((m) => m.getName());
	console.log(`${prop.out.padEnd(14)} ${Math.round(glb.byteLength / 1024)} KB (geometry was ${Math.round(before / 1024)} KB, plus 4K textures)  materials: ${materials.join(", ")}`);
}
