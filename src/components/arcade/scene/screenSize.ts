import geometry from "./cabinet-geometry.json";

/** The live screen's layout size in CSS pixels: 640 wide, the glass's shape. Kept free of three.js so the page can use it. */
export const size = { w: 640, h: Math.round((640 * geometry.screen.height) / geometry.screen.width) };
