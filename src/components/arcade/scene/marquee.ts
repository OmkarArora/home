import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * Pictures drawn on a canvas for the scene's lit signs: the cabinet's marquee
 * and the neon sign on the wall. Both use the arcade's pixel font, so they
 * wait for it to load before drawing.
 */

export const lime = "#c6f03a";

async function ready(family: string, px: number) {
	try {
		await document.fonts.load(`${px}px ${family}`);
	} catch {
		// Draws in the fallback font; still readable.
	}
}

/** The marquee: a backlit lime panel, "OMKAR'S ARCADE" and the machine's name. */
export async function drawMarquee(texture: CanvasTexture | null, family: string, title: string) {
	const canvas = (texture?.image as HTMLCanvasElement | undefined) ?? Object.assign(document.createElement("canvas"), { width: 1024, height: 280 });
	const ctx = canvas.getContext("2d");
	if (!ctx) return texture;
	await ready(family, 96);
	const { width: w, height: h } = canvas;

	const glow = ctx.createLinearGradient(0, 0, 0, h);
	glow.addColorStop(0, "#1d2a04");
	glow.addColorStop(0.5, "#56760e");
	glow.addColorStop(1, "#1d2a04");
	ctx.fillStyle = glow;
	ctx.fillRect(0, 0, w, h);

	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#e6ffa3";
	ctx.font = `28px ${family}`;
	ctx.fillText("OMKAR'S", w / 2, h * 0.2);
	ctx.shadowColor = lime;
	ctx.shadowBlur = 24;
	ctx.fillStyle = "#f6ffd9";
	ctx.font = `104px ${family}`;
	ctx.fillText("ARCADE", w / 2, h * 0.55);
	ctx.shadowBlur = 0;
	ctx.fillStyle = "#d9f58a";
	ctx.font = `22px ${family}`;
	ctx.fillText(title.toUpperCase(), w / 2, h * 0.88);

	const out = texture ?? new CanvasTexture(canvas);
	out.colorSpace = SRGBColorSpace;
	// The model's texture coordinates already run top to bottom.
	out.flipY = false;
	out.needsUpdate = true;
	return out;
}

/** The wall sign: "ARCADE" as a lime neon tube, a pale core inside a wide glow, on black. */

/**
 * The attract screen, drawn on the cabinet's glass: what the screen shows
 * when the live machine (a DOM layer) has faded out because the glass is
 * turned away. Dark, scanlined, the machine's name and INSERT COIN.
 */
export async function drawAttract(texture: CanvasTexture | null, family: string, title: string) {
	const canvas = (texture?.image as HTMLCanvasElement | undefined) ?? Object.assign(document.createElement("canvas"), { width: 512, height: 384 });
	const ctx = canvas.getContext("2d");
	if (!ctx) return texture;
	await ready(family, 32);
	const { width: w, height: h } = canvas;
	ctx.fillStyle = "#06070a";
	ctx.fillRect(0, 0, w, h);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.shadowColor = lime;
	ctx.shadowBlur = 14;
	ctx.fillStyle = lime;
	ctx.font = `30px ${family}`;
	ctx.fillText(title.toUpperCase(), w / 2, h * 0.42);
	ctx.shadowBlur = 0;
	ctx.fillStyle = "#ededE6";
	ctx.font = `16px ${family}`;
	ctx.fillText("INSERT COIN", w / 2, h * 0.62);
	ctx.fillStyle = "rgb(0 0 0 / 0.35)";
	for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);

	const out = texture ?? new CanvasTexture(canvas);
	out.colorSpace = SRGBColorSpace;
	out.flipY = false;
	out.needsUpdate = true;
	return out;
}
