import type { Metadata } from "next";

import { baseUrl } from "@/app/sitemap";
import { identity } from "@/content/profile";

import type { getBlogPosts } from "./posts";

type Post = Awaited<ReturnType<typeof getBlogPosts>>[number];

/** A post's one true address. Any other route that renders it points here. */
export const postUrl = (slug: string) => `${baseUrl}/blog/${slug}`;

function imageFor(post: Post) {
	const { image } = post.metadata;
	if (!image) return `${baseUrl}/og?slug=${encodeURIComponent(post.slug)}`;
	return image.startsWith("http") ? image : `${baseUrl}${image}`;
}

export function postMetadata(post: Post): Metadata {
	const { title, summary: description, publishedAt, updatedAt, keywords } = post.metadata;
	const image = imageFor(post);

	return {
		title,
		description,
		keywords: keywords || undefined,
		alternates: { canonical: postUrl(post.slug) },
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime: publishedAt,
			modifiedTime: updatedAt ?? publishedAt,
			url: postUrl(post.slug),
			images: [{ url: image }],
		},
		twitter: { card: "summary_large_image", title, description, images: [image] },
	};
}

/** Structured data: the post itself, and where it sits in the site. */
export function postJsonLd(post: Post) {
	const { title, summary, publishedAt, updatedAt } = post.metadata;
	const author = { "@type": "Person", name: identity.name, url: baseUrl };

	return [
		{
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: title,
			description: summary,
			datePublished: publishedAt,
			dateModified: updatedAt ?? publishedAt,
			image: imageFor(post),
			url: postUrl(post.slug),
			mainEntityOfPage: postUrl(post.slug),
			author,
			publisher: author,
		},
		{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
				{ "@type": "ListItem", position: 2, name: "Dev log", item: `${baseUrl}/blog` },
				{ "@type": "ListItem", position: 3, name: title, item: postUrl(post.slug) },
			],
		},
	];
}

/** The `<script>` body. `<` is escaped so post text can never close the tag. */
export const jsonLdScript = (post: Post) => JSON.stringify(postJsonLd(post)).replace(/</g, "\\u003c");
