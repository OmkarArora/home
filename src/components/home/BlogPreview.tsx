import { formatDate, getBlogPosts } from "@/lib/posts";
import Link from "next/link";

export async function BlogPreview() {
	const allBlogs = await getBlogPosts();
	// Sort by published date (newest first) and take latest 3
	const latestBlogs = allBlogs
		.sort((a, b) => {
			const dateA = new Date(a.metadata.publishedAt).getTime();
			const dateB = new Date(b.metadata.publishedAt).getTime();
			return dateB - dateA;
		})
		.slice(0, 3);

	if (latestBlogs.length === 0) {
		return null;
	}

	return (
		<section id="blog" className="max-w-4xl mx-auto px-6 py-16">
			<div className="flex items-center justify-between mb-12">
				<h2 className="text-2xl font-semibold">Blog</h2>
				<Link
					href="/blog"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					View all →
				</Link>
			</div>
			<div className="space-y-8 -mx-8">
				{latestBlogs.map((post) => (
					<Link
						key={post.slug}
						href={`/blog/${post.slug}`}
						className="block group"
					>
						<div className="flex flex-col space-y-2 p-4 rounded-lg outline-1 outline-transparent group-hover:outline-border group-hover:shadow-md group-hover:bg-accent/5 transition-all duration-300 ease-in-out mx-4">
							<p className="text-sm text-muted-foreground tabular-nums">
								{formatDate(post.metadata.publishedAt, false)}
							</p>
							<h3 className="text-lg font-medium text-foreground tracking-tight">
								{post.metadata.title}
							</h3>
							{post.metadata.summary && (
								<p className="text-sm text-muted-foreground line-clamp-2">
									{post.metadata.summary}
								</p>
							)}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
