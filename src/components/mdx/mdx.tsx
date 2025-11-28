import Link from "next/link";
import Image, { type ImageProps } from "next/image";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";
import React from "react";

type TableData = {
	headers: string[];
	rows: string[][];
};

function Table({ data }: { data: TableData }) {
	let headers = data.headers.map((header: string, index: number) => (
		<th key={index}>{header}</th>
	));
	let rows = data.rows.map((row: string[], index: number) => (
		<tr key={index}>
			{row.map((cell: string, cellIndex: number) => (
				<td key={cellIndex}>{cell}</td>
			))}
		</tr>
	));

	return (
		<table>
			<thead>
				<tr>{headers}</tr>
			</thead>
			<tbody>{rows}</tbody>
		</table>
	);
}

function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	let href = props.href;

	if (!href) {
		return <a {...props} />;
	}

	if (href.startsWith("/")) {
		return (
			<Link href={href} {...props}>
				{props.children}
			</Link>
		);
	}

	if (href.startsWith("#")) {
		return <a {...props} />;
	}

	return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props: ImageProps) {
	const { alt, className, ...rest } = props;
	return (
		<Image
			alt={alt || ""}
			className={`rounded-lg ${className || ""}`}
			{...rest}
		/>
	);
}

function Code({
	children,
	...props
}: {
	children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
	let codeHTML = highlight(String(children));
	return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function slugify(str: string | React.ReactNode): string {
	return String(str)
		.toString()
		.toLowerCase()
		.trim() // Remove whitespace from both ends of a string
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/&/g, "-and-") // Replace & with 'and'
		.replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
		.replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level: number) {
	const Heading = ({ children }: { children: React.ReactNode }) => {
		let slug = slugify(children);
		return React.createElement(
			`h${level}`,
			{ id: slug },
			[
				React.createElement("a", {
					href: `#${slug}`,
					key: `link-${slug}`,
					className: "anchor",
				}),
			],
			children
		);
	};

	Heading.displayName = `Heading${level}`;

	return Heading;
}

let components = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
	Image: RoundedImage,
	a: CustomLink,
	code: Code,
	Table,
};

export function CustomMDX(props: MDXRemoteProps) {
	return (
		<MDXRemote
			{...props}
			components={{ ...components, ...(props.components || {}) }}
		/>
	);
}
