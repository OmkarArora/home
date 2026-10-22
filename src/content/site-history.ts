/**
 * Every version of this site, newest first. Screens live in
 * `public/images/history/`, cropped to one screenful from the full-page
 * captures kept locally in `scratch/site-history/`.
 */

export type Version = {
	key: string;
	label: string;
	when: string;
	name: string;
	address: string;
	summary: string;
	notes: string[];
	status: string;
};

export const versions: Version[] = [
	{
		key: "v3",
		label: "v3",
		when: "Oct 2026",
		name: "Patch notes",
		address: "omkararora.com",
		summary:
			"The one you're reading. Bricolage Grotesque and JetBrains Mono, one lime accent, and a line that draws itself down the Work page as you scroll.",
		notes: [
			"Chosen over two other candidates, Editorial and Panels, built side by side in a lab",
			"Work, Projects, an Arcade of playable experiments, and the dev log, each a page of its own",
			"The blog restyled to match, with an outline, reading times and collapsible code",
		],
		status: "In the lab, about to ship",
	},
	{
		key: "v2",
		label: "v2",
		when: "2025 – 2026",
		name: "omkararora.com",
		address: "omkararora.com",
		summary:
			"Next.js, shadcn/ui and Tailwind CSS on a domain of my own. It started as a one-page résumé, the version the Wayback Machine first archived on 20 Aug 2025.",
		notes: [
			"The MDX blog arrived in November 2025, with live demos inside the posts",
			"Five posts in three weeks: the blog itself, SEO, syntax highlighting, demos, optimistic updates",
		],
		status: "Replaced by v3",
	},
	{
		key: "v1",
		label: "v1",
		when: "2020",
		name: "omkararora.netlify.app",
		address: "omkararora.netlify.app",
		summary:
			"Built in my final year of college: a purple accent, unDraw illustrations, and every project numbered, from a weather app to an Airbnb lookalike.",
		notes: [
			"Ten projects, February 2020 to January 2021, in plain JavaScript, React and Node",
			'One post: "The HTML <meta> tag", 24 Nov 2020',
		],
		status: "Still online, to be redirected here",
	},
];
