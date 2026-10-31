import { getBlogPosts } from "@/lib/posts";

export const baseUrl = "https://omkararora.com";

/** Every page meant for search. */
const pages = ["", "/work", "/projects", "/blog", "/about", "/history", "/arcade"];

/**
 * Posts carry the date they were written. Pages carry no date: a build date
 * would claim every page changed on every deploy, and search engines learn to
 * ignore a lastmod that's always today.
 */
export default async function sitemap() {
	const blogs = (await getBlogPosts()).map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.metadata.publishedAt,
	}));

	const routes = pages.map((route) => ({ url: `${baseUrl}${route}` }));

	return [...routes, ...blogs];
}
