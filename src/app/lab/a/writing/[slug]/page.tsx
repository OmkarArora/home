import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Outline } from "@/components/lab/a/Outline";
import { base, label, mono, riseAt } from "@/components/lab/a/ui";
import { allPosts, shortDate } from "@/components/lab/data";
import { CustomMDX } from "@/components/mdx/mdx";
import { jsonLdScript, postMetadata } from "@/lib/post-seo";
import { getBlogPosts, getPostBySlug, headings } from "@/lib/posts";

import "./post.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
	return (await getBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const post = await getPostBySlug((await params).slug);
	return post ? postMetadata(post) : {};
}

export default async function Post({ params }: Props) {
	const { slug } = await params;
	const post = await getPostBySlug(slug);
	if (!post) notFound();

	// Newest first, so the entry number counts up from the oldest.
	const posts = await allPosts();
	const index = posts.findIndex((entry) => entry.slug === slug);
	const entry = posts[index];
	const newer = posts[index - 1];
	const older = posts[index + 1];
	const { updatedAt } = post.metadata;

	return (
		<>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{ __html: jsonLdScript(post) }}
			/>

			<header className="py-14 md:py-20">
				<p className={`${label} rise flex flex-wrap gap-x-3 gap-y-1`} style={riseAt(0)}>
					<Link href={`${base}/writing`} className="hover:text-[var(--ink)]">
						← Dev log
					</Link>
					<span className="text-[var(--accent-ink)]">#{String(posts.length - index).padStart(2, "0")}</span>
					<time dateTime={post.metadata.publishedAt}>{shortDate(post.metadata.publishedAt)}</time>
					<span>{entry.minutes} min read</span>
				</p>
				<h1
					style={riseAt(1)}
					className="rise mt-5 max-w-5xl text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance [font-stretch:85%]"
				>
					{post.metadata.title}
				</h1>
				<p style={riseAt(2)} className="rise mt-6 max-w-2xl text-lg leading-relaxed text-[var(--dim)]">
					{post.metadata.summary}
				</p>
				{updatedAt && updatedAt !== post.metadata.publishedAt && (
					<p style={riseAt(3)} className={`${label} rise mt-4`}>
						Revised <time dateTime={updatedAt}>{shortDate(updatedAt)}</time>
					</p>
				)}
			</header>

			<div
				style={riseAt(3)}
				className="rise border-t border-[var(--ink)] pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-x-12"
			>
				<Outline items={headings(post.content)} />
				<article className="post-body prose prose-theme dark:prose-invert col-start-1 row-start-1 max-w-none min-w-0">
					<CustomMDX source={post.content} />
				</article>
			</div>

			<nav aria-label="More from the dev log" className="mt-16 grid gap-4 border-t border-[var(--ink)] pt-8 md:grid-cols-2">
				{[
					{ post: older, kicker: "← Older" },
					{ post: newer, kicker: "Newer →" },
				].map(({ post: other, kicker }) =>
					other ? (
						<Link
							key={kicker}
							href={`${base}/writing/${other.slug}`}
							className="border border-[var(--ink)] p-6 transition-colors hover:bg-[var(--lime)] hover:text-[#0c0c0d] md:last:text-right"
						>
							<p className={`${mono} text-xs uppercase tracking-[0.18em] opacity-70`}>{kicker}</p>
							<p className="mt-3 text-xl leading-snug font-bold tracking-tight">{other.title}</p>
						</Link>
					) : (
						<span key={kicker} className="hidden md:block" />
					),
				)}
			</nav>
		</>
	);
}
