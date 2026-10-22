import { BlogPosts } from "@/components/blog/posts";
import { JsonLd } from "@/components/json-ld";
import { allPosts } from "@/components/lab/data";
import { blog, canonical, graph } from "@/lib/site-seo";

export const metadata = {
	title: "Blog",
	description: "Notes on frontend engineering by Omkar Arora, most with live demos you can play with.",
	...canonical("/blog"),
};

export default async function Page() {
	const posts = await allPosts();
	return (
		<section className="max-w-4xl mx-auto px-6 py-16">
			<JsonLd json={graph(blog(posts))} />
			<h1 className="text-2xl font-semibold mb-12 tracking-tighter">Blog</h1>
			<BlogPosts />
		</section>
	);
}
