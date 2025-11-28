import { getBlogPosts } from "@/lib/posts";

export const baseUrl = "https://omkararora.com";

// export default async function sitemap() {
// 	const blogs = (await getBlogPosts()).map((post) => ({
// 		url: `${baseUrl}/blog/${post.slug}`,
// 		lastModified: post.metadata.publishedAt,
// 	}));

// 	let routes = ["", "/blog"].map((route) => ({
// 		url: `${baseUrl}${route}`,
// 		lastModified: new Date().toISOString().split("T")[0],
// 	}));

// 	return [...routes, ...blogs];
// }

export default async function sitemap() {
	// Temporarily exclude blog posts
	// const blogs = (await getBlogPosts()).map((post) => ({
	// 	url: `${baseUrl}/blog/${post.slug}`,
	// 	lastModified: post.metadata.publishedAt,
	// }));

	let routes = [""].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes]; // Removed ...blogs
}
