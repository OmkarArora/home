/**
 * The theme switch's bloom: a radial-gradient mask that grows out of a point,
 * so the new look spreads as a soft-edged circle over the old, on the page's
 * View Transition.
 *
 * The element (or pseudo-element) needs the mask itself in CSS, e.g.
 * `mask-image: radial-gradient(circle closest-side, #000 70%, transparent 100%)`,
 * `mask-repeat: no-repeat` and a starting `mask-size: 0 0`.
 */
export function bloom(
	target: Element,
	origin: { x: number; y: number },
	box: { w: number; h: number },
	{ pseudoElement }: { pseudoElement?: string } = {},
) {
	const { x, y } = origin;
	const { w, h } = box;
	// Far enough to cover the furthest corner, with room for the soft edge (the gradient fades over its outer 30%).
	const reach = Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) * 2.9;
	const at = (size: number) => ({ maskSize: `${size}px ${size}px`, maskPosition: `${x - size / 2}px ${y - size / 2}px` });
	return target.animate([at(0), at(reach)], {
		duration: 800,
		easing: "cubic-bezier(0.45, 0, 0.2, 1)",
		// Hold the full size until the caller is done; otherwise the mask drops back to 0 for a
		// frame or two first, and the old look flashes through.
		fill: "forwards",
		pseudoElement,
	});
}
