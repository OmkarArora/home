import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx/mdx";
import { formatDate, getBlogPosts } from "@/lib/posts";

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

	const posts = await getBlogPosts();
	const post = posts.find((post) => post.slug === slug);
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
		: `${baseUrl}/og?title=${encodeURIComponent(title)}`;

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
							: `/og?title=${encodeURIComponent(post.metadata.title)}`,
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
		</section>
	);
}
