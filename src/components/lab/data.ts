import { getBlogPosts } from "@/lib/posts";

/** The newest posts first — the same ordering the current home page uses. */
export async function latestPosts(count: number) {
	return (await allPosts()).slice(0, count);
}

export async function allPosts() {
	const posts = await getBlogPosts();
	return posts
		.sort(
			(a, b) =>
				new Date(b.metadata.publishedAt).getTime() -
				new Date(a.metadata.publishedAt).getTime(),
		)
		.map((post) => ({
			slug: post.slug,
			title: post.metadata.title,
			summary: post.metadata.summary,
			publishedAt: post.metadata.publishedAt,
		}));
}

export function shortDate(date: string) {
	return new Date(date).toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
