import type { Snap } from "@/components/site/Polaroids";

/** His Instagram posts, for the art and photos in the polaroid stacks. */
const instagram = {
	goku: "https://www.instagram.com/p/Dd_YAZ3Cjir/",
	asta: "https://www.instagram.com/p/Ddehb0NvvOB/",
	tokyo: "https://www.instagram.com/p/DVBEx_8ESHa3v4I3TBbGSrBN6xAGJKwhJ1cxDY0/",
};

/** The art and photos on the home page's stack (and the Arcade's Polaroid machine). */
export const snaps = {
	goku: { kind: "art", src: "/images/display-art/kid-goku.jpeg", alt: "Drawing of Kid Goku in a fighting stance", caption: "Kid Goku", href: instagram.goku, contain: true },
	tower: { kind: "photo", src: "/images/display-pics/tokyo-tower.jpeg", alt: "Tokyo Tower through snowy trees", caption: "Tokyo Tower", href: instagram.tokyo },
	asta: { kind: "art", src: "/images/display-art/asta-demon.jpeg", alt: "Painting of Asta raising his demon sword against a red sky", caption: "Asta", href: instagram.asta },
	cat: { kind: "photo", src: "/images/display-pics/black-cat.jpeg", alt: "A black cat sitting on moss", caption: "A garden cat", href: instagram.tokyo },
	castle: { kind: "photo", src: "/images/display-pics/tokyo-castle.jpeg", alt: "A Japanese castle tower under snow", caption: "Tokyo in snow", href: instagram.tokyo },
} satisfies Record<string, Snap>;
