/**
 * What Omkar built at Sparklin Innovations, November 2021 – April 2026.
 *
 * Assembled from his resume and the blurbs on the old home page, which is not
 * much: his own notes are still to come. Until then, anything marked
 * `draft: true` is a guess from the screenshots or simply unknown, and the
 * Work page shows it as a placeholder rather than passing it off as fact.
 */

export const company = {
	name: "Sparklin Innovations",
	when: "Nov 2021 – Apr 2026",
	titles: "Software Development Engineer, then SDE 2",
	summary:
		"Four and a half years building products end to end: the frontend architecture, the shared components, and the caching and SEO work that kept them fast and findable.",
};

/** Outcomes, as stated on his resume. */
export const outcomes = [
	{ value: "30%", label: "faster data fetching", how: "Browser, query and CDN caching, plus optimistic UI" },
	{ value: "20%", label: "more organic traffic", how: "Dynamic metadata, schema markup, prefetching, smaller bundles" },
	{ value: "15%", label: "more mobile engagement", how: "React Native prototypes of navigation and interaction flows" },
];

export type Screen = { src: string; alt: string; width: number; height: number };

export type Product = {
	name: string;
	years?: string;
	status?: string;
	/** What the product was, for someone who never saw it. */
	what: string;
	/** His part in it. */
	part: string;
	/** The stacks the product went through while he worked on it, in order. */
	journey?: string[];
	points: string[];
	skills: string[];
	screens: Screen[];
	/** `what` is a guess (or missing) and needs his own words. */
	draft?: true;
};

const screens = (folder: string, name: string, sizes: Array<[number, number]>): Screen[] =>
	sizes.map(([width, height], index) => ({
		src: `/images/projects/${folder}/screenshot${index + 1}.webp`,
		alt: `${name}, screen ${index + 1} of ${sizes.length}`,
		width,
		height,
	}));

/** Newest first. Years confirmed by Omkar, matching the Wayback Machine's captures. */
export const products: Product[] = [
	{
		name: "Jupitun",
		years: "2025",
		status: "Sunsetted",
		what: "A productivity OS: calendar, chat and the rest of a team's day in one app.",
		part: "Built the frontend architecture around a local-first approach, so the interface answers at once and syncs behind the scenes.",
		points: ["Optimistic updates throughout", "Tuned for performance and for how it feels to use"],
		skills: ["Next.js", "React", "Tailwind CSS", "Local-first"],
		screens: [],
	},
	{
		name: "Recommendations.email",
		years: "2024 – 2025",
		status: "Sunsetted",
		what: "One movie recommendation in your inbox every day, from the team behind Openvy.",
		part: "Built the email templates and a word-guessing game that sat alongside them.",
		points: [
			"Responsive, fast email templates in React Email",
			"A word-guessing game that keeps score against the player's Openvy login",
		],
		skills: ["Next.js", "React Email", "TypeScript", "Tailwind CSS"],
		screens: screens("remail", "Recommendations.email", [
			[2880, 1798],
			[2880, 2300],
			[2880, 1928],
		]),
	},
	{
		name: "Openvy",
		years: "2021 – 2026",
		status: "Sunsetted",
		what: "A social app for the films, shows, music and places people are into, with group chats around them.",
		draft: true,
		part: "I worked on it through four stacks, and led the last one, the Next.js web app, end to end.",
		journey: ["Angular", "React Native app", "Native iOS (Swift)", "Next.js web"],
		points: [
			"Led the web app's architecture, routing and docs for new engineers",
			"Browser, query and CDN caching with optimistic UI",
			"SEO pipeline: dynamic metadata, schema markup, prefetching",
			"React Native prototypes that lifted mobile engagement 15%",
		],
		skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "React Native", "Swift", "Angular"],
		screens: screens("openvy", "Openvy", [
			[3456, 1776],
			[3456, 1776],
			[3024, 1964],
			[3024, 1774],
			[3456, 1776],
		]),
	},
];

/** The rest of the job, from his resume. */
export const also = [
	"Shared UI components and frontend utilities adopted in the ICICI Internet Banking app",
	"React Native prototypes that tested navigation, rendering and interaction flows",
	"Frontend architecture standards, review workflows, and clear state and API boundaries",
];
