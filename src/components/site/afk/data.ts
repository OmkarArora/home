/**
 * What he does away from the keyboard, for the AFK section. Being compared in
 * four layouts at /about/afk; the winner moves to About and this moves to
 * `src/content/profile.ts`.
 *
 * Every `line` is a DRAFT, kept to what his work and photos already show, for
 * Omkar to rewrite. `stat` is for the Achievements version and is his to fill.
 */

export type Afk = {
	key: string;
	label: string;
	/** A short mono note shown beside it. */
	note: string;
	line: string;
	image?: { src: string; alt: string; contain?: boolean };
	/** Achievements version: a title for it, and a number he supplies. */
	badge: string;
	stat?: string;
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
		badge: "Steady Hand",
	},
	{
		key: "gaming",
		label: "Gaming",
		note: "Play & build",
		line: "Playing them, and lately building them: Game Night started at a game night.",
		badge: "Player Two",
	},
	{
		key: "anime",
		label: "Anime",
		note: "Shōnen first",
		line: "Dragon Ball and Black Clover, by the look of the sketchbook.",
		image: { src: "/images/display-art/kid-goku.jpeg", alt: "Drawing of Kid Goku in a fighting stance", contain: true },
		badge: "Power Level",
	},
	{
		key: "travel",
		label: "Travel",
		note: "Japan, lately",
		line: "Tokyo in the snow, and Fuji from the lake.",
		image: { src: "/images/display-pics/tokyo-tower.jpeg", alt: "Tokyo Tower through snowy trees" },
		badge: "Passport Stamp",
		suggested: true,
	},
	{
		key: "badminton",
		label: "Badminton",
		note: "On court",
		line: "Draft: how often you play, and with whom.",
		badge: "Smash",
	},
	{
		key: "fitness",
		label: "Fitness",
		note: "Training",
		line: "Draft: what training looks like for you.",
		badge: "Rep Counter",
	},
	{
		key: "heroes",
		label: "Superheroes",
		note: "Comics & films",
		line: "Draft: comics, films, or both, and the favourite.",
		badge: "Origin Story",
	},
	{
		key: "movies",
		label: "Movies",
		note: "Rewatches",
		line: "Draft: the kind of film you go back to.",
		badge: "Director's Cut",
	},
];

/** For the scrapbook: photos that aren't tied to one interest. */
export const extras = [
	{ src: "/images/display-pics/black-cat.jpeg", alt: "A black cat sitting on moss", caption: "A garden cat" },
	{ src: "/images/display-pics/tokyo-castle.jpeg", alt: "A Japanese castle tower under snow", caption: "Tokyo in snow" },
	{ src: "/images/omkar-fuji.jpg", alt: "Omkar by a lake, Mt Fuji behind", caption: "Mt Fuji" },
];
