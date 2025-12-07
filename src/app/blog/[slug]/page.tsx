import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx/mdx";
import { formatDate, getBlogPosts, getPostBySlug } from "@/lib/posts";

export async function generateStaticParams() {
	const posts = await getBlogPosts();

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const slug = (await params).slug;

	const post = await getPostBySlug(slug);
	if (!post) {
		return;
	}

	let {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
		keywords,
	} = post.metadata;
	let ogImage = image
		? image
		: `${baseUrl}/og?slug=${encodeURIComponent(slug)}`;

	return {
		title,
		description,
		keywords: keywords || undefined,
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			url: `${baseUrl}/blog/${post.slug}`,
			images: [
				{
					url: ogImage,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
		},
	};
}

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const slug = (await params).slug;
	const posts = await getBlogPosts();
	const post = posts.find((post) => post.slug === slug);

	if (!post) {
		return (
			<section className="max-w-4xl mx-auto px-6 py-16">
				<div>Post not found</div>
			</section>
		);
	}

	return (
		<section className="max-w-4xl mx-auto px-6 py-16">
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BlogPosting",
						headline: post.metadata.title,
						datePublished: post.metadata.publishedAt,
						dateModified: post.metadata.publishedAt,
						description: post.metadata.summary,
						image: post.metadata.image
							? `${baseUrl}${post.metadata.image}`
							: `/og?slug=${encodeURIComponent(slug)}`,
						url: `${baseUrl}/blog/${post.slug}`,
						author: {
							"@type": "Person",
							name: "My Portfolio",
						},
					}),
				}}
			/>

			<article className="prose prose-theme dark:prose-invert max-w-none">
				<h1 className="mb-0!">{post.metadata.title}</h1>
				<div className="flex justify-between items-center mb-8 text-sm">
					<p className="text-sm text-muted-foreground">
						{formatDate(post.metadata.publishedAt)}
					</p>
				</div>
				<CustomMDX source={post.content} />
			</article>

			{(slug === "how-i-built-my-blog" ||
				slug === "seo-optimization-for-nextjs-blog" ||
				slug === "improving-syntax-highlighting") && (
				<div className="mt-12 pt-8 border-t border-border">
					<p className="text-sm text-muted-foreground mb-2">
						Here's a link to my{" "}
						<a
							href="https://github.com/OmkarArora/home"
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-foreground hover:underline inline-flex items-baseline gap-1"
						>
							<svg
								className="w-4 h-4 relative top-0.5"
								fill="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
									clipRule="evenodd"
								/>
							</svg>
							<span>GitHub</span>
						</a>{" "}
						portfolio repository with MDX blogs so you can refer to it.
					</p>
				</div>
			)}
		</section>
	);
}
