/**
 * What he does away from the keyboard, for About's AFK section: a list of
 * interests (pointing at one fans out its pictures), then a wall of his own
 * art and photos, then his Instagram pages.
 *
 * Every `line` is a DRAFT, kept to what his work and photos already show, for
 * Omkar to rewrite.
 */

/** A picture for an interest. Posters are official artwork, shown as favourites. */
export type Pic = {
	src: string;
	alt: string;
	caption: string;
	/** A drawing on white: show it whole, not cropped. */
	contain?: boolean;
};

export type Afk = {
	key: string;
	label: string;
	/** A short mono note shown beside it. */
	note: string;
	line: string;
	pictures: Pic[];
	/** On the wall of his own work (art and photos), not just in the list. */
	onWall?: true;
	/** Not one of his stated interests: suggested from his photos. */
	suggested?: true;
};

const art = (file: string, alt: string, caption: string, contain = false): Pic => ({
	src: `/images/display-art/${file}`,
	alt,
	caption,
	contain,
});
/** `short` is the caption when the full title won't fit on a polaroid. */
const poster = (folder: string, file: string, title: string, short = title): Pic => ({
	src: `/images/${folder}/${file}`,
	alt: `${title} poster`,
	caption: short,
});

export const afk: Afk[] = [
	{
		key: "art",
		label: "Art",
		note: "Ink & digital",
		line: "Anime characters, mostly. Ink on paper, colour on a screen.",
		pictures: [
			art("asta-demon.jpeg", "Painting of Asta raising his demon sword against a red sky", "Asta"),
			art("kid-goku.jpeg", "Drawing of Kid Goku in a fighting stance", "Kid Goku", true),
			art("minato.jpg", "Drawing of Minato from behind, his Fourth Hokage cloak", "Minato"),
		],
		onWall: true,
	},
	{
		key: "gaming",
		label: "Gaming",
		note: "Play & build",
		line: "Playing them, and lately building them: Game Night started at a game night.",
		pictures: [
			poster("display-games", "eldenring-poster.webp", "Elden Ring"),
			poster("display-games", "minecraft-poster.jpg", "Minecraft"),
			poster("display-games", "valorant-poster.jpg", "Valorant"),
		],
	},
	{
		key: "anime",
		label: "Anime",
		note: "Shōnen first",
		line: "Naruto to Haikyu!!, and the characters in my sketchbook.",
		pictures: [
			poster("display-anime", "naruto-poster.webp", "Naruto"),
			poster("display-anime", "dragonball-poster.webp", "Dragon Ball"),
			poster("display-anime", "demonslayer-poster.webp", "Demon Slayer"),
			poster("display-anime", "haikyu-poster.webp", "Haikyu!!"),
		],
	},
	{
		key: "travel",
		label: "Travel",
		note: "Japan, lately",
		line: "Tokyo in the snow, and Fuji from the lake.",
		pictures: [
			{ src: "/images/display-pics/tokyo-tower.jpeg", alt: "Tokyo Tower through snowy trees", caption: "Tokyo Tower" },
			{ src: "/images/display-pics/tokyo-castle.jpeg", alt: "A Japanese castle tower under snow", caption: "Tokyo in snow" },
			{ src: "/images/display-pics/black-cat.jpeg", alt: "A black cat sitting on moss", caption: "A garden cat" },
		],
		onWall: true,
		suggested: true,
	},
	{
		key: "badminton",
		label: "Badminton",
		note: "On court",
		line: "Draft: how often you play, and with whom.",
		pictures: [],
	},
	{
		key: "fitness",
		label: "Fitness",
		note: "Training",
		line: "Draft: what training looks like for you.",
		pictures: [],
	},
	{
		key: "movies",
		label: "Movies & TV",
		note: "Films & series",
		line: "Draft: the films and shows you go back to.",
		pictures: [
			poster("display-movies", "znmd-poster.webp", "Zindagi Na Milegi Dobara", "ZNMD"),
			poster("display-movies", "spiderman-poster.jpg", "Spider-Man"),
			poster("display-movies", "suits-poster.webp", "Suits"),
			poster("display-movies", "himym-poster.webp", "How I Met Your Mother", "HIMYM"),
		],
	},
];

/** His Instagram pages, linked under the snapshots. */
export const elsewhere = [
	{ href: "https://www.instagram.com/goingbananas.art", handle: "@goingbananas.art", what: "Art" },
	{ href: "https://www.instagram.com/halfcoldgamesyt", handle: "@halfcoldgamesyt", what: "Gaming, casual uploads" },
];
