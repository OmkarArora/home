import { promises as fs } from "fs";
import path from "path";

type Metadata = {
	title: string;
	publishedAt: string;
	summary: string;
	image?: string;
	// tags?: string[];
	author: string;
};

// function parseFrontmatter(fileContent: string) {
// 	let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
// 	let match = frontmatterRegex.exec(fileContent);
// 	let frontMatterBlock = match![1];
// 	let content = fileContent.replace(frontmatterRegex, "").trim();
// 	let frontMatterLines = frontMatterBlock.trim().split("\n");
// 	let metadata: Partial<Metadata> = {};

// 	frontMatterLines.forEach((line) => {
// 		let [key, ...valueArr] = line.split(": ");
// 		let value = valueArr.join(": ").trim();
// 		value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
// 		metadata[key.trim() as keyof Metadata] = value;
// 	});

// 	return { metadata: metadata as Metadata, content };
// }

// async function getMDXFiles(dir: string) {
// 	return await fs
// 		.readdir(dir)
// 		.then((files) => files.filter((file) => path.extname(file) === ".mdx"));
// }

// async function readMDXFile(filePath: string) {
// 	let rawContent = await fs.readFile(filePath, "utf-8");
// 	return parseFrontmatter(rawContent);
// }

// async function getMDXData(dir: string) {
// 	let mdxFiles = await getMDXFiles(dir);
// 	return await Promise.all(
// 		mdxFiles.map(async (file) => {
// 			let { metadata, content } = await readMDXFile(path.join(dir, file));
// 			let slug = path.basename(file, path.extname(file));
// 			return { metadata, slug, content };
// 		})
// 	);
// }

// export async function getBlogPosts() {
// 	return await getMDXData(path.join(process.cwd(), "src", "content"));
// }

// Helper function to normalize MDX metadata to our Metadata type
function normalizeMetadata(mdxMetadata: any): Metadata {
	return {
		title: mdxMetadata.title,
		publishedAt: mdxMetadata.date || mdxMetadata.publishedAt,
		summary: mdxMetadata.description || mdxMetadata.summary,
		image: mdxMetadata.image,
		author: mdxMetadata.author,
	};
}

// Get metadata for a single post by slug
export async function getPostMetadata(slug: string) {
	const { metadata: mdxMetadata } = await import(`@/content/${slug}.mdx`);
	return normalizeMetadata(mdxMetadata);
}

export async function getBlogPosts() {
	// return await getMDXData(path.join(process.cwd(), "src", "content"));

	const slugs = await fs
		.readdir(path.join(process.cwd(), "src", "content"))
		.then((files) => files.filter((file) => path.extname(file) === ".mdx"));

	// Retrieve metadata from MDX files
	const posts = await Promise.all(
		slugs.map(async (slug) => {
			const slugWithoutExt = path.basename(slug, path.extname(slug));
			const { metadata: mdxMetadata } = await import(
				`@/content/${slugWithoutExt}.mdx`
			);
			const metadata = normalizeMetadata(mdxMetadata);
			return { slug: slugWithoutExt, metadata };
		})
	);

	// sort posts by publishedAt date
	const sortedPosts = posts.sort((a, b) => {
		return (
			new Date(b.metadata.publishedAt).getTime() -
			new Date(a.metadata.publishedAt).getTime()
		);
	});

	return sortedPosts;
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
