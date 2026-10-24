/**
 * What Omkar has shipped at ixigo, from his own write-up (shipped-work.html,
 * built from merge requests and git history).
 *
 * Only work that reached production is here. Left out on purpose: anything
 * still in development or review, internal merge-request links, and internal
 * codenames. Merge-request, commit and file counts are dropped too: they say
 * how much was typed, not what it was worth.
 */

export type Product = "flights" | "cabs";

export const productLabel: Record<Product, string> = {
	flights: "Flights",
	cabs: "Cabs",
};

export type Surface = "mweb" | "desktop" | "cabs";

export const surfaceLabel: Record<Surface, string> = {
	mweb: "Mobile web",
	desktop: "Desktop",
	cabs: "Cabs web",
};

/**
 * A clip of the feature in use. `poster` only matters for video. `credit`
 * names the source when the clip isn't Omkar's own, such as one of ixigo's
 * launch videos, which is played from ixigo's server rather than copied. The
 * credit links to the feature's own page, where the video comes from.
 */
export type Media = {
	type: "video" | "image";
	src: string;
	alt: string;
	poster?: string;
	/** Its real size, so the slot takes its shape instead of cropping it. */
	width?: number;
	height?: number;
	credit?: { label: string; href: string };
};

export type Shipped = {
	/** The month it finished shipping, as YYYY-MM. Orders the timeline. */
	month: string;
	/** How it reads on the page — some features shipped over a few months. */
	when: string;
	product: Product;
	surfaces: Surface[];
	/** The big ones: they lead the home page and get a media slot. */
	feature?: true;
	title: string;
	/** Set when the launch was a team's: the piece that was his. */
	part?: string;
	summary: string;
	points: string[];
	skills: string[];
	media?: Media;
};

export const shipped: Shipped[] = [
	{
		month: "2026-09",
		when: "Sep 2026",
		product: "flights",
		surfaces: ["mweb"],
		feature: true,
		title: "Smart Lock",
		part: "The search screen every Smart Lock starts from",
		summary: "A paid agent that watches fares and locks the first flight within your budget.",
		points: [
			"Flexible dates with a ± window",
			"Calendar and traveller pickers, shared with flight search",
			"Cabin classes Smart Lock can lock",
			"Hero, live ticker and dark mode",
		],
		skills: ["Product launch", "Forms", "Shared components", "Motion"],
		media: {
			type: "video",
			// ixigo's launch video, compressed to the size it's shown at (360px wide, no audio:
			// 0.9 MB instead of 4.8 MB) and served from here. The original is at
			// https://videos.ixigo.com/flights/smart_lock_video_9sep2026.mp4.
			src: "/videos/smart-lock.mp4",
			poster: "/images/work/smart-lock-poster.jpg",
			width: 360,
			height: 782,
			alt: "ixigo's Smart Lock launch video: choosing a route, dates and preferences, setting a budget, and the flight it finds",
			credit: { label: "Smart Lock on ixigo", href: "https://www.ixigo.com/smart-lock" },
		},
	},
	{
		month: "2026-08",
		when: "Jun – Aug 2026",
		product: "flights",
		surfaces: ["mweb"],
		title: "Airport cab cross-sell in the flights hero",
		summary:
			"A glass card on the flights home that offers a cab to or from the airport, with a typewriter placeholder cycling through drop options.",
		points: [
			"Reusable useTypewriter hook: SSR-safe, respects reduced motion, pauses when hidden",
			"Reworked the hero layout so the CTA stays put whatever the content height",
		],
		skills: ["Cross-sell", "Hooks", "Layout"],
	},
	{
		month: "2026-07",
		when: "Jul 2026",
		product: "flights",
		surfaces: ["mweb", "desktop"],
		title: "Doctors & Nurses special fare",
		summary:
			"A new special-fare option across search, results, review and calendar, on both mobile web and desktop.",
		points: ["Moved all special-fare config into one source of truth"],
		skills: ["Search", "Refactor"],
	},
	{
		month: "2026-06",
		when: "May – Jun 2026",
		product: "flights",
		surfaces: ["mweb"],
		title: "Flash sale hero",
		summary: "The home hero runs a whole flash sale on its own schedule, with no reloads.",
		points: [
			"Live countdown capsule",
			"Sleeps until the next change, never polls",
			"Keeps time in hidden and throttled tabs",
			"Synced to the hero's dock animation",
		],
		skills: ["React", "Scheduling", "Motion", "Vitest"],
	},
	{
		month: "2026-06",
		when: "May – Jun 2026",
		product: "cabs",
		surfaces: ["cabs"],
		feature: true,
		title: "Partial payment for cabs",
		summary: "Pay part of the fare to book, and the rest to the driver. Built end to end.",
		points: [
			"Plan picker on the review page",
			"Trip page and fare summary",
			"Rescheduling on the new contract",
			"11 analytics events",
		],
		skills: ["React", "Zustand", "Payments", "Analytics"],
	},
	{
		month: "2026-06",
		when: "Jun 2026",
		product: "cabs",
		surfaces: ["cabs"],
		title: "Airport cab search, rebuilt",
		summary:
			'Users first pick "To Airport" or "From Airport", then each field searches the right source: airports from our database, places from Google.',
		points: [
			"Server-side near-airport check shown as a confirm popup",
			"Safe migration of old saved searches to the new shape",
			"Swap animation using View Transitions, 56 lines smaller than before",
		],
		skills: ["Autocomplete", "View Transitions", "Migration"],
	},
	{
		month: "2026-06",
		when: "Jun 2026",
		product: "flights",
		surfaces: ["mweb"],
		title: "One analytics event for every booking interruption",
		summary:
			"Replaced four inconsistent events with one interruption event. Error types match the native apps, and every event records which page it came from.",
		points: [
			"Product can now slice the booking funnel by page and reason",
			"Covered the sold-out case, which used to send nothing",
		],
		skills: ["Funnel analytics"],
	},
	{
		month: "2026-06",
		when: "Jun 2026",
		product: "flights",
		surfaces: ["mweb"],
		title: "Co-branded home for partner apps",
		summary:
			'Partner apps see "Book Flights with ixigo" with our logo. ixigo\'s own apps keep the default title, and partners no longer see the login banner.',
		points: [],
		skills: ["White-label", "Multi-client"],
	},
];

/** He joined in April 2026; the first of this shipped in May. */
export const since = "Apr 2026";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type Month = { key: string; label: string; shipped: Shipped[] };

/** Everything grouped by month, newest first — the shape the timeline draws. */
export function timeline(): Month[] {
	const keys = [...new Set(shipped.map((item) => item.month))].sort().reverse();
	return keys.map((key) => ({
		key,
		label: `${MONTHS[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`,
		shipped: shipped.filter((item) => item.month === key),
	}));
}

/** The features big enough to get a stop of their own. */
export const majors = (): Shipped[] => shipped.filter((item) => item.feature);

/** Everything else, by month, for the compact list. Fixes are left out: shipping them is the job. */
export function alsoShipped(): Month[] {
	return timeline()
		.map((month) => ({ ...month, shipped: month.shipped.filter((item) => !item.feature) }))
		.filter((month) => month.shipped.length > 0);
}
