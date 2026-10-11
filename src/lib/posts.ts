import fs from "fs/promises";
import path from "path";

import { slugify } from "./slugify";

type Metadata = {
	title: string;
	publishedAt: string;
	/** Set when a post is revised after it was published. */
	updatedAt?: string;
	summary: string;
	image?: string;
	keywords?: string;
};

function parseFrontmatter(fileContent: string) {
	let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
	let match = frontmatterRegex.exec(fileContent);
	let frontMatterBlock = match![1];
	let content = fileContent.replace(frontmatterRegex, "").trim();
	let frontMatterLines = frontMatterBlock.trim().split("\n");
	let metadata: Partial<Metadata> = {};

	frontMatterLines.forEach((line) => {
		let [key, ...valueArr] = line.split(": ");
		let value = valueArr.join(": ").trim();
		value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
		metadata[key.trim() as keyof Metadata] = value;
	});

	return { metadata: metadata as Metadata, content };
}

async function getMDXFiles(dir: string) {
	const files = await fs.readdir(dir);
	return files.filter((file) => path.extname(file) === ".mdx");
}

async function readMDXFile(filePath: string) {
	const rawContent = await fs.readFile(filePath, "utf-8");
	return parseFrontmatter(rawContent);
}

async function getMDXData(dir: string) {
	const mdxFiles = await getMDXFiles(dir);
	const posts = await Promise.all(
		mdxFiles.map(async (file) => {
			const { metadata, content } = await readMDXFile(path.join(dir, file));
			const slug = path.basename(file, path.extname(file));

			return {
				metadata,
				slug,
				content,
			};
		})
	);
	return posts;
}

export async function getBlogPosts() {
	return getMDXData(path.join(process.cwd(), "src", "content", "posts"));
}

export async function getPostBySlug(slug: string) {
	const posts = await getBlogPosts();
	return posts.find((post) => post.slug === slug);
}

/** The prose only: no code samples, no demo components. */
function proseOf(content: string) {
	return content
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/<[A-Z][\s\S]*?\/>/g, " ")
		.replace(/<[^>]+>/g, " ");
}

/** Minutes to read a post, at an unhurried 220 words a minute. */
export function readingTime(content: string) {
	const words = proseOf(content).split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 220));
}

export type Heading = { text: string; id: string };

/**
 * The post's sections (its `##` headings), in order, for its outline. The
 * sub-headings are left out: a long post has dozens, which is no outline at all.
 */
export function headings(content: string): Heading[] {
	const found: Heading[] = [];
	let inCode = false;
	for (const line of content.split("\n")) {
		if (line.trimStart().startsWith("```")) {
			inCode = !inCode;
			continue;
		}
		const match = !inCode && /^##\s+(.+?)\s*$/.exec(line);
		if (!match) continue;
		// Drop inline markup, as the rendered heading's own text does.
		const text = match[1].replace(/[`*_]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
		found.push({ text, id: slugify(text) });
	}
	return found;
}

export function formatDate(date: string, includeRelative = false) {
	let currentDate = new Date();
	if (!date.includes("T")) {
		date = `${date}T00:00:00`;
	}
	let targetDate = new Date(date);

	let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
	let monthsAgo = currentDate.getMonth() - targetDate.getMonth();
	let daysAgo = currentDate.getDate() - targetDate.getDate();

	let formattedDate = "";

	if (yearsAgo > 0) {
		formattedDate = `${yearsAgo}y ago`;
	} else if (monthsAgo > 0) {
		formattedDate = `${monthsAgo}mo ago`;
	} else if (daysAgo > 0) {
		formattedDate = `${daysAgo}d ago`;
	} else {
		formattedDate = "Today";
	}

	let fullDate = targetDate.toLocaleString("en-us", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});

	if (!includeRelative) {
		return fullDate;
	}

	return `${fullDate} (${formattedDate})`;
}
