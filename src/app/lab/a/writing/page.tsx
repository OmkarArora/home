import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/lab/a/Reveal";
import { PageHead, label, mono } from "@/components/lab/a/ui";
import { allPosts, shortDate } from "@/components/lab/data";

export const metadata: Metadata = {
	title: "Dev log — Omkar Arora",
	description: "Notes on frontend engineering, most with live demos.",
};

export default async function Writing() {
	const posts = await allPosts();

	return (
		<>
			<PageHead kicker={`Dev log · ${posts.length} entries`} title="Dev log.">
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
							<span className={`${label} md:pt-1.5`}>{shortDate(post.publishedAt)}</span>
							<div>
								<h2 className="text-2xl leading-snug font-bold tracking-tight group-hover:underline group-hover:decoration-[var(--accent)] group-hover:decoration-4 group-hover:underline-offset-4">
									{post.title}
								</h2>
								{post.summary && (
									<p className="mt-2 max-w-2xl leading-relaxed text-[var(--muted)]">{post.summary}</p>
								)}
							</div>
						</Link>
					</Reveal>
				))}
			</ol>
		</>
	);
}
