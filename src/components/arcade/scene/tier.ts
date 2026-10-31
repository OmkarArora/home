/**
 * Is this a phone (or a small screen)? There the scene draws lighter: fewer particles, a lower
 * resolution, smaller shadow maps and a plain floor instead of the mirror.
 */
export const small = () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px), (pointer: coarse)").matches;
