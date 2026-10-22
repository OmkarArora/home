/**
 * Structured data (JSON-LD) for the site as a whole: who Omkar is, what the
 * site is, and what the blog holds. Built from the same content the pages
 * render, so the two can't drift apart. Per-post data is in `post-seo.ts`.
 *
 * Every node has an `@id`, so the person, the site and the blog refer to one
 * another instead of repeating themselves.
 */

import { baseUrl } from "@/app/sitemap";
import { identity } from "@/content/profile";

export const ids = {
	person: `${baseUrl}/#person`,
	website: `${baseUrl}/#website`,
	blog: `${baseUrl}/blog#blog`,
};

/** The address a page should be known by. Lab pages pass the path they will have once live. */
export const canonical = (path: string) => ({ alternates: { canonical: `${baseUrl}${path}` } });

export function person() {
	return {
		"@type": "Person",
		"@id": ids.person,
		name: identity.name,
		url: baseUrl,
		jobTitle: identity.title,
		worksFor: { "@type": "Organization", name: identity.company, url: "https://www.ixigo.com" },
		address: { "@type": "PostalAddress", addressLocality: identity.location.split(",")[0], addressCountry: "IN" },
		knowsAbout: identity.stack,
		sameAs: [identity.links.github, identity.links.linkedin],
	};
}

export function website() {
	return {
		"@type": "WebSite",
		"@id": ids.website,
		name: identity.name,
		url: baseUrl,
		inLanguage: "en",
		author: { "@id": ids.person },
		publisher: { "@id": ids.person },
	};
}

type PostSummary = { slug: string; title: string; summary?: string; publishedAt: string; updatedAt?: string };

/** The blog, listing every post. Search engines read this as the blog's table of contents. */
export function blog(posts: PostSummary[]) {
	return {
		"@type": "Blog",
		"@id": ids.blog,
		name: `${identity.name} — Dev log`,
		url: `${baseUrl}/blog`,
		author: { "@id": ids.person },
		isPartOf: { "@id": ids.website },
		blogPost: posts.map((post) => ({
			"@type": "BlogPosting",
			headline: post.title,
			description: post.summary,
			url: `${baseUrl}/blog/${post.slug}`,
			datePublished: post.publishedAt,
			dateModified: post.updatedAt ?? post.publishedAt,
			author: { "@id": ids.person },
		})),
	};
}

/** One or more nodes as a single `@graph`, escaped so page text can never close the script tag. */
export function graph(...nodes: object[]) {
	return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
