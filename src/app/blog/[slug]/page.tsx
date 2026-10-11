import { notFound } from "next/navigation";

import { CustomMDX } from "@/components/mdx/mdx";
import { jsonLdScript, postMetadata } from "@/lib/post-seo";
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
	const post = await getPostBySlug((await params).slug);
	return post ? postMetadata(post) : undefined;
}

export default async function Page({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const post = await getPostBySlug((await params).slug);
	if (!post) notFound();

	return (
		<section className="max-w-4xl mx-auto px-6 py-16">
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{ __html: jsonLdScript(post) }}
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
