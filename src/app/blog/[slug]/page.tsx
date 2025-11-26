import { baseUrl } from "@/app/sitemap";
import { getBlogPosts, getPostMetadata } from "@/lib/posts";

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
	const metadata = await getPostMetadata(slug);

	const ogImage = metadata.image
		? metadata.image
		: `${baseUrl}/og?title=${encodeURIComponent(metadata.title)}`;

	return {
		title: metadata.title,
		description: metadata.summary,
		openGraph: {
			title: metadata.title,
			description: metadata.summary,
			type: "article",
			publishedTime: metadata.publishedAt,
			url: `${baseUrl}/blog/${slug}`,
			images: [
				{
					url: ogImage,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: metadata.title,
			description: metadata.summary,
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
	const { default: Post } = await import(`@/content/${slug}.mdx`);

	if (!Post) {
		return <div>Post not found</div>;
	}

	return (
		<div>
			<Post />
		</div>
	);
}
