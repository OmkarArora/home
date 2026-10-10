/**
 * What Omkar has shipped at ixigo, from his own write-up (shipped-work.html,
 * built from merge requests and git history).
 *
 * Only work that reached production is here. Left out on purpose: anything
 * still in development or review, internal merge-request links, and internal
 * codenames. Per-feature file and commit counts are dropped too.
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

/** A clip of the feature in use. `poster` only matters for video. */
export type Media = { type: "video" | "image"; src: string; alt: string; poster?: string };

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
	/** Set when the launch was a team's and his part needs saying. */
	role?: string;
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
		title: "Smart Lock: where every fare-watching agent starts",
		role: "Team launch · I built the search screen",
		summary:
			"Smart Lock is a paid agent that scans fares around the clock and price-locks the first flight within the user's budget, refunding the fee if nothing matches. I built the screen every Smart Lock starts from: route, flexible dates, travellers and cabin class in one compact form.",
		points: [
			"Flexible-date calendar that highlights the ± window around the chosen date",
			"Moved the calendar sheet and traveller/class picker into shared components, now used by both flight search and Smart Lock",
			"Lockable cabin-class options, so Smart Lock limits choices without forking the picker",
			"Hero, live ticker animation, benefits and footer, with dark mode support",
		],
		skills: ["Product launch", "Forms", "Shared components", "Motion"],
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
		month: "2026-08",
		when: "Aug 2026",
		product: "flights",
		surfaces: ["mweb"],
		title: "Partial payment slot in the flights hero",
		summary:
			"Added support for the partial-payment hero slot that the backend sends, reusing the existing summary-card layout with no new UI.",
		points: [],
		skills: ["Backend contract"],
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
		feature: true,
		title: "Flash sale hero: timed slides and a live countdown",
		summary:
			"The home hero now runs a whole flash sale from backend JSON. Slides show and hide on their own as the sale moves from pre-sale to live to extended, with no page reload.",
		points: [
			"Countdown header capsule with a scroll-driven title reveal and shrinking digits",
			"A scheduler that sleeps until the next window boundary instead of polling",
			"Keeps correct time when the tab is hidden, throttled or brought back",
			"Synced the capsule to the hero's dock animation using a shared docked signal",
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
		summary:
			"Riders can book an eligible cab by paying part of the fare upfront and the rest to the driver at the end of the trip. Built end to end across booking, the trip page and rescheduling.",
		points: [
			'Plan picker footer on review, plus a per-cab "Partial payment available" note',
			"Ride Confirmed pill and fare summary rows that stay correct after the trip ends",
			"Reschedule flow on the new contract, with a per-cab note",
			"11 analytics events; fixed 4 bugs found along the way, including an infinite loop on the trip page",
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
		title: 'Timed "Search similar flights" button',
		summary:
			"When a chosen flight sells out, the sheet's main button fills up and then searches for alternatives on its own. Tapping it goes straight away.",
		points: [
			"Reusable TimedButton component, animated on the compositor",
			"Respects reduced motion and uses design-system tokens",
		],
		skills: ["Component design", "Motion"],
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

export type Win = { month: string; product: Product; what: string; note?: string };

/** Fixes and improvements that reached production. */
export const wins: Win[] = [
	{
		month: "2026-09",
		product: "flights",
		what: "Upcoming trips card handles partial flight data",
		note: "No more broken cards when the backend leaves fields out",
	},
	{
		month: "2026-07",
		product: "flights",
		what: "Review page opens the contact or billing sheet on a validation error",
		note: "Falls back to the city when the address is missing",
	},
	{
		month: "2026-07",
		product: "flights",
		what: "Booking-source tracking on confirmation",
		note: "Helps find bookings that land on the wrong app",
	},
	{ month: "2026-07", product: "flights", what: "Booking loader stays visible until the payment redirect" },
	{ month: "2026-07", product: "flights", what: "Attribution token set on flight init and payment success" },
	{ month: "2026-06", product: "flights", what: "Recent searches can't crash the home page anymore" },
	{
		month: "2026-06",
		product: "flights",
		what: "Fixed a search-form hydration mismatch from a server-side default date",
	},
	{ month: "2026-06", product: "flights", what: "Deals filter row hidden when it has only one option" },
	{ month: "2026-06", product: "cabs", what: "Fare summary animates its discount rows in and out" },
	{ month: "2026-06", product: "cabs", what: "Coupon state clears when the user switches cab" },
];

/** The span the write-up covers. Some features began a month before they shipped. */
export const period = "May – Sep 2026";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The headline numbers from his write-up. */
export const totals = [
	{ value: "14", label: "merge requests merged" },
	{ value: "190+", label: "commits in production" },
	{ value: "3", label: "codebases: flights mobile web, flights desktop, cabs" },
];

export type Month = { key: string; label: string; shipped: Shipped[]; wins: Win[] };

/** Everything grouped by month, newest first — the shape the timeline draws. */
export function timeline(): Month[] {
	const keys = [...new Set([...shipped, ...wins].map((item) => item.month))].sort().reverse();
	return keys.map((key) => ({
		key,
		label: `${MONTHS[Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`,
		shipped: shipped.filter((item) => item.month === key),
		wins: wins.filter((item) => item.month === key),
	}));
}
