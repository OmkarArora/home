import { getBlogPosts } from "@/lib/posts";

export const baseUrl = "https://omkararora.com";

/** Every page meant for search. The Arcade is left out until it has something in it. */
const pages = ["", "/work", "/projects", "/blog", "/about", "/history"];

export default async function sitemap() {
	const blogs = (await getBlogPosts()).map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
	}));

	const routes = pages.map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...blogs];
}
