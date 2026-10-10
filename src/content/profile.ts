/**
 * Everything the home page says, apart from blog posts (those stay MDX).
 *
 * Kept apart from any layout so the design lab's versions all render the same
 * facts, and whichever wins inherits finished content.
 *
 * Anything marked `placeholder: true` is a stand-in for something only Omkar
 * can supply. The versions render it visibly as a placeholder rather than
 * passing it off as real.
 */

export type Placeholder = { placeholder?: true };

export const identity = {
	name: "Omkar Arora",
	firstName: "Omkar",
	title: "Senior Frontend Engineer",
	company: "ixigo",
	location: "Gurugram, India",
	/** First full-time role: Sparklin, November 2021. */
	careerStart: new Date("2021-11-01"),
	pitch:
		"I build fast, careful interfaces — and the plumbing underneath that keeps them fast when real people show up.",
	/**
	 * The About page's longer introduction. DRAFT, assembled only from the facts
	 * in this file, for Omkar to rewrite in his own voice.
	 */
	about: [
		"I'm a frontend engineer at ixigo, in Gurugram. I started as an intern at Homerunn in 2020, spent three years at Sparklin building products end to end, and joined ixigo in 2024.",
		"Outside work I build things for fun — lately Game Night, party games for a room full of phones — and write up what I learn along the way.",
	],
	email: "aroraomkar12@gmail.com",
	links: {
		github: "https://github.com/OmkarArora",
		linkedin: "https://www.linkedin.com/in/omkar-arora-0ab08375",
		resume: "/resume",
	},
	stack: ["React", "Next.js", "TypeScript", "Motion", "Convex"],
};

export function yearsOfExperience(now = new Date()): number {
	const years =
		(now.getTime() - identity.careerStart.getTime()) /
		(365.25 * 24 * 60 * 60 * 1000);
	return Math.floor(years);
}

export type Project = {
	name: string;
	summary: string;
	stack: string[];
	href?: string;
	repo?: string;
	/** A write-up worth more than the link itself. */
	caseStudy?: { href: string; label: string };
	highlight?: { value: string; label: string };
	year: string;
};

export const projects: Project[] = [
	{
		name: "Game Night",
		summary:
			"Real-time party games for a room of phones — Dots and Boxes, Wavelength, Pictionary and Uno — with room codes, no sign-up, and every move synced live.",
		stack: ["React", "TanStack Start", "Convex", "Tailwind", "Playwright"],
		href: "https://gamenight.omkararora.com",
		caseStudy: {
			href: "https://gamenight.omkararora.com/performance",
			label: "How I cut its database reads 6×",
		},
		highlight: { value: "6.1×", label: "fewer rows read" },
		year: "2026",
	},
	{
		name: "Team Resume Builder",
		summary:
			"Create, edit and export resumes as PDF, with team management and a type-safe routing layer.",
		stack: ["React", "Vite", "Zustand", "@react-pdf/renderer"],
		href: "https://team-resume-builder.vercel.app/",
		repo: "https://github.com/OmkarArora/team-resume-builder",
		year: "2025",
	},
	{
		name: "Highlight Saver",
		summary:
			"A Chrome extension that saves highlights from any page, with exclusions, a full-page view and optional AI summaries.",
		stack: ["TypeScript", "React", "Manifest V3"],
		repo: "https://github.com/OmkarArora/highlight-extension",
		year: "2025",
	},
	{
		name: "This site",
		summary:
			"Next.js App Router, an MDX blog with live interactive demos, and generated OG images.",
		stack: ["Next.js", "MDX", "Tailwind"],
		repo: "https://github.com/OmkarArora/home",
		year: "2025",
	},
];

export type Role = Placeholder & {
	company: string;
	title: string;
	from: string;
	to: string;
	summary: string;
	/** Products shipped in this role. */
	products?: string[];
};

export const roles: Role[] = [
	{
		// From his shipped-work write-up; the features themselves are in ixigo.ts.
		company: "ixigo",
		title: "Software Development Engineer 2",
		from: "2024",
		to: "Now",
		summary:
			"Flights and cabs on the web: the search screen for Smart Lock, a flash-sale hero that runs itself, partial payment for cabs, and the analytics underneath.",
	},
	{
		// Openvy, Recommendations.email and Jupitun were all Sparklin products
		// (confirmed by Omkar). The 30% / 20% caching and SEO numbers sat beside
		// them on the old site, so they move here too. QUESTION: confirm.
		company: "Sparklin Innovations",
		title: "Software Development Engineer",
		from: "2021",
		to: "2024",
		summary:
			"Frontend for Openvy, Recommendations.email and Jupitun. Caching and SEO work cut data-fetching time 30% and lifted organic traffic 20%; React Native prototypes lifted mobile engagement 15%.",
		products: ["Openvy", "Recommendations.email", "Jupitun"],
	},
	{
		company: "Homerunn",
		title: "Frontend Intern",
		from: "2020",
		to: "2020",
		summary: "Rendering fixes that made pages load 20% faster.",
	},
];

export type Interest = {
	key: "gaming" | "badminton" | "anime" | "heroes" | "movies";
	label: string;
	emoji: string;
	/** Draft copy, for Omkar to replace in his own voice. */
	line: string;
	/** Favourites. Placeholders until Omkar names his own. */
	picks: Array<{ name: string } & Placeholder>;
};

export const interests: Interest[] = [
	{
		key: "gaming",
		label: "Gaming",
		emoji: "🎮",
		line: "Draft line — what you play, and how.",
		picks: [{ name: "Favourite game", placeholder: true }],
	},
	{
		key: "badminton",
		label: "Badminton",
		emoji: "🏸",
		line: "Draft line — how often you play, and with whom.",
		picks: [{ name: "Racquet / club", placeholder: true }],
	},
	{
		key: "anime",
		label: "Anime",
		emoji: "📺",
		line: "Draft line — what you watch, and what you rewatch.",
		picks: [{ name: "All-time favourite", placeholder: true }],
	},
	{
		key: "heroes",
		label: "Superheroes",
		emoji: "🦸",
		line: "Draft line — comics, films, or both.",
		picks: [{ name: "Favourite hero", placeholder: true }],
	},
	{
		key: "movies",
		label: "Movies",
		emoji: "🎬",
		line: "Draft line — the kind of film you go back to.",
		picks: [{ name: "Comfort movie", placeholder: true }],
	},
];
