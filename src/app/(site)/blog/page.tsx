import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/site/Reveal";
import { PageHead, label, mono } from "@/components/site/ui";
import { allPosts, shortDate } from "@/components/site/data";
import { JsonLd } from "@/components/json-ld";
import { blog, graph, pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
	...pageMetadata("/blog", {
		title: "Blog — Omkar Arora",
		description: "Notes on frontend engineering by Omkar Arora, most with live demos you can play with.",
	}),
};

export default async function Writing() {
	const posts = await allPosts();

	return (
		<>
			<JsonLd json={graph(blog(posts))} />
			<PageHead kicker={`Dev log · ${posts.length} entries`} title="Dev log." meaning="Blog posts by Omkar Arora">
				Notes on building for the web — most of them with demos you can play with.
			</PageHead>

			<ol className="border-t border-[var(--ink)]">
				{posts.map((post, index) => (
					<Reveal as="li" index={index} key={post.slug} className="border-b border-[var(--line)]">
						<Link
							href={`/blog/${post.slug}`}
							className="group grid gap-x-8 gap-y-2 py-7 md:grid-cols-[5rem_9rem_1fr]"
						>
							<span className={`${mono} hidden text-sm font-bold text-[var(--accent-ink)] md:block`}>
								#{String(posts.length - index).padStart(2, "0")}
							</span>
							<span className={`${label} md:pt-1.5`}>
								{shortDate(post.publishedAt)}
								<span className="ml-3 md:ml-0 md:mt-1 md:block">{post.minutes} min read</span>
							</span>
							<div>
								<h2 className="text-2xl leading-snug font-bold tracking-tight group-hover:underline group-hover:decoration-[var(--lime)] group-hover:decoration-4 group-hover:underline-offset-4">
									{post.title}
								</h2>
								{post.summary && (
									<p className="mt-2 max-w-2xl leading-relaxed text-[var(--dim)]">{post.summary}</p>
								)}
							</div>
						</Link>
					</Reveal>
				))}
			</ol>
		</>
	);
}
