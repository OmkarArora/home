/**
 * Structured data (JSON-LD) for the site as a whole: who Omkar is, what the
 * site is, and what the blog holds. Built from the same content the pages
 * render, so the two can't drift apart. Per-post data is in `post-seo.ts`.
 *
 * Every node has an `@id`, so the person, the site and the blog refer to one
 * another instead of repeating themselves.
 */

import type { Metadata } from "next";

import { baseUrl } from "@/app/sitemap";
import { elsewhere } from "@/content/afk";
import { identity } from "@/content/profile";

export const ids = {
	person: `${baseUrl}/#person`,
	website: `${baseUrl}/#website`,
	blog: `${baseUrl}/blog#blog`,
};

/**
 * A page's metadata: its title and description, the address it should be known
 * by, and the card a shared link to it shows (drawn by `/og`).
 */
export function pageMetadata(path: string, { title, description }: { title: string; description: string }): Metadata {
	const url = `${baseUrl}${path}`;
	const image = `${baseUrl}/og?page=${path.slice(1) || "home"}`;
	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title,
			description,
			url,
			siteName: identity.name,
			type: "website",
			images: [{ url: image, width: 1200, height: 630, alt: title }],
		},
		twitter: { card: "summary_large_image", title, description, images: [image] },
	};
}

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
		sameAs: [identity.links.github, identity.links.linkedin, ...elsewhere.map((page) => page.href)],
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

/**
 * A page of the site, with a breadcrumb back to home. `type` is schema.org's
 * kind of page (AboutPage, CollectionPage…); `extra` adds what it's about.
 */
export function webPage(
	path: string,
	{ name, description, type = "WebPage", ...extra }: { name: string; description: string; type?: string } & Record<string, unknown>,
) {
	const url = `${baseUrl}${path}`;
	return {
		"@type": type,
		"@id": `${url}#page`,
		url,
		name,
		description,
		inLanguage: "en",
		isPartOf: { "@id": ids.website },
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
				{ "@type": "ListItem", position: 2, name, item: url },
			],
		},
		...extra,
	};
}

/** A numbered list of things, for a page that's a collection of them. */
export function itemList(items: object[]) {
	return {
		"@type": "ItemList",
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, item })),
	};
}

/** One or more nodes as a single `@graph`, escaped so page text can never close the script tag. */
export function graph(...nodes: object[]) {
	return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
