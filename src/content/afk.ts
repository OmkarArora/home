/**
 * What he does away from the keyboard, for About's AFK section: a list of
 * interests, then a wall of his art and photos, then his Instagram pages.
 *
 * Every `line` is a DRAFT, kept to what his work and photos already show, for
 * Omkar to rewrite.
 */

export type Afk = {
	key: string;
	label: string;
	/** A short mono note shown beside it. */
	note: string;
	line: string;
	image?: { src: string; alt: string; contain?: boolean };
	/** Not one of his stated interests: suggested from his photos. */
	suggested?: true;
};

export const afk: Afk[] = [
	{
		key: "art",
		label: "Art",
		note: "Ink & digital",
		line: "Anime characters, mostly. Ink on paper, colour on a screen.",
		image: { src: "/images/display-art/asta-demon.jpeg", alt: "Painting of Asta raising his demon sword against a red sky" },
	},
	{
		key: "gaming",
		label: "Gaming",
		note: "Play & build",
		line: "Playing them, and lately building them: Game Night started at a game night.",
	},
	{
		key: "anime",
		label: "Anime",
		note: "Shōnen first",
		line: "Dragon Ball and Black Clover, by the look of the sketchbook.",
		image: { src: "/images/display-art/kid-goku.jpeg", alt: "Drawing of Kid Goku in a fighting stance", contain: true },
	},
	{
		key: "travel",
		label: "Travel",
		note: "Japan, lately",
		line: "Tokyo in the snow, and Fuji from the lake.",
		image: { src: "/images/display-pics/tokyo-tower.jpeg", alt: "Tokyo Tower through snowy trees" },
		suggested: true,
	},
	{
		key: "badminton",
		label: "Badminton",
		note: "On court",
		line: "Draft: how often you play, and with whom.",
	},
	{
		key: "fitness",
		label: "Fitness",
		note: "Training",
		line: "Draft: what training looks like for you.",
	},
	{
		key: "heroes",
		label: "Superheroes",
		note: "Comics & films",
		line: "Draft: comics, films, or both, and the favourite.",
	},
	{
		key: "movies",
		label: "Movies",
		note: "Rewatches",
		line: "Draft: the kind of film you go back to.",
	},
];

/** His Instagram pages, linked under the snapshots. */
export const elsewhere = [
	{ href: "https://www.instagram.com/goingbananas.art", handle: "@goingbananas.art", what: "Art" },
	{ href: "https://www.instagram.com/halfcoldgamesyt", handle: "@halfcoldgamesyt", what: "Gaming, casual uploads" },
];

/** For the scrapbook: photos that aren't tied to one interest. */
export const extras = [
	{ src: "/images/display-pics/black-cat.jpeg", alt: "A black cat sitting on moss", caption: "A garden cat" },
	{ src: "/images/display-pics/tokyo-castle.jpeg", alt: "A Japanese castle tower under snow", caption: "Tokyo in snow" },
];
