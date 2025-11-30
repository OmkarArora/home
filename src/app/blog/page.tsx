import { BlogPosts } from "@/components/blog/posts";

export const metadata = {
	title: "Blog",
	description: "Read my blog.",
};

export default function Page() {
	return (
		<section className="max-w-4xl mx-auto px-6 py-16">
			<h1 className="text-2xl font-semibold mb-12 tracking-tighter">Blog</h1>
			<BlogPosts />
		</section>
	);
}
