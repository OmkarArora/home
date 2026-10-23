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
	/** Unknown for all three until his notes arrive. */
	years?: string;
	status?: string;
	/** What the product was, for someone who never saw it. */
	what: string;
	/** His part in it. */
	part: string;
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

/** Newest first. DRAFT ORDER: the real sequence is one of the things to confirm. */
export const products: Product[] = [
	{
		name: "Jupitun",
		status: "Sunsetted",
		what: "A work OS: calendar, chat and the rest of a team's day in one app.",
		part: "Built the frontend architecture around a local-first approach, so the interface answers at once and syncs behind the scenes.",
		points: ["Optimistic updates throughout", "Tuned for performance and for how it feels to use"],
		skills: ["Next.js", "React", "Tailwind CSS", "Local-first"],
		screens: [],
	},
	{
		name: "Recommendations.email",
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
		status: "Sunsetted",
		what: "A social app for the films, shows, music and places people are into, with group chats around them.",
		draft: true,
		part: "Designed and owned the frontend architecture.",
		points: [
			"Modular features and predictable routing, documented so new engineers got going quickly",
			"Browser, query and CDN caching with optimistic UI",
			"An SEO and performance pipeline: dynamic metadata, schema markup, route prefetching",
			"Reusable UI primitives and custom hooks shared across the products",
		],
		skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Motion", "Caching", "SEO"],
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
