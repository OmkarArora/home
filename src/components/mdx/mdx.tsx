import Link from "next/link";
import Image, { type ImageProps } from "next/image";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { CodeBlock } from "./code-block";
import { LivePreview } from "./LivePreview";
import { InteractiveDemo } from "./InteractiveDemo";
import { ComparisonDemo } from "./ComparisonDemo";
import { StepByStepDemo } from "./StepByStepDemo";
import { CounterDemo } from "./demos/CounterDemo";
import { FormValidationDemo } from "./demos/FormValidationDemo";
import { ApiSimulatorDemo } from "./demos/ApiSimulatorDemo";
import { AnimationDemo } from "./demos/AnimationDemo";
import { LazyAnimationDemo } from "./LazyAnimationDemo";
import { OptimisticLikeDemo } from "./demos/OptimisticLikeDemo";
import { OptimisticTodoDemo } from "./demos/OptimisticTodoDemo";
import { UseOptimisticThreadDemo } from "./demos/UseOptimisticThreadDemo";
import { OptimisticComparisonDemo } from "./demos/OptimisticComparisonDemo";
import React from "react";
import { slugify } from "@/lib/slugify";

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

/** The words in a heading, whatever inline markup wraps them. */
function textOf(node: React.ReactNode): string {
	if (typeof node === "string" || typeof node === "number") return String(node);
	if (Array.isArray(node)) return node.map(textOf).join("");
	if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
	return "";
}

function createHeading(level: number) {
	const Heading = ({ children }: { children: React.ReactNode }) => {
		let slug = slugify(textOf(children));
		return React.createElement(
			`h${level}`,
			{ id: slug },
			[
				React.createElement("a", {
					href: `#${slug}`,
					key: `link-${slug}`,
					className: "anchor",
					"aria-label": "Link to this section",
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
	pre: CodeBlock,
	Table,
	LivePreview,
	InteractiveDemo,
	ComparisonDemo,
	StepByStepDemo,
	CounterDemo,
	FormValidationDemo,
	ApiSimulatorDemo,
	AnimationDemo,
	LazyAnimationDemo,
	OptimisticLikeDemo,
	OptimisticTodoDemo,
	UseOptimisticThreadDemo,
	OptimisticComparisonDemo,
};

export function CustomMDX(props: MDXRemoteProps) {
	return (
		<MDXRemote
			{...props}
			components={{ ...components, ...(props.components || {}) }}
			options={{
				// The posts are our own files, and several demos take their content
				// as props (`code={...}`, `steps={[...]}`). The library strips those
				// expressions by default, which left the demos empty.
				blockJS: false,
				mdxOptions: {
					remarkPlugins: [remarkGfm],
					rehypePlugins: [
						[
							rehypePrettyCode,
							{
								theme: {
									light: "github-light",
									dark: "github-dark",
								},
								keepBackground: false,
							},
						],
					],
				},
			}}
		/>
	);
}
