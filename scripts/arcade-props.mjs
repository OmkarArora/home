/**
 * Prepares the Arcade room's props, all from Sketchfab (CC BY 4.0, credited
 * on the page): a record player, a CRT TV and a PlayStation. They come with
 * 4K PNG textures (25–75 MB each), far too heavy for a prop in the corner.
 *
 * For each: scale to its real size, stand it on the floor centred, shrink the
 * textures to 1024 px WebP, and weld, quantize and meshopt-compress the
 * geometry.
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

const props = [
	// How big each really is, along one axis (metres), to scale it to.
	{ source: "yamaha_tt-300_record_player", out: "record-player", axis: 0, size: 0.43 },
	{ source: "sony_pvm-14l2_crt_tv", out: "crt-tv", axis: 1, size: 0.34 },
	{ source: "sony_playstation_one", out: "playstation", axis: 2, size: 0.193 },
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
