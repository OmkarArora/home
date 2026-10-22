"use client";

import { Children, isValidElement, useId, useRef, useState } from "react";
import { CopyButton } from "./copy-button";

/** Longer than this, a block opens collapsed. */
const COLLAPSE_OVER = 20;

/** How many lines the highlighter produced: one `data-line` span per line. */
function countLines(node: React.ReactNode): number {
	let count = 0;
	Children.forEach(node, (child) => {
		if (!isValidElement<{ children?: React.ReactNode; "data-line"?: unknown }>(child)) return;
		if (child.props["data-line"] !== undefined) count += 1;
		else count += countLines(child.props.children);
	});
	return count;
}

export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
	const [code, setCode] = useState("");

	function extractCode(node: HTMLPreElement | null) {
		if (node) {
			const codeElement = node.querySelector("code");
			if (codeElement) {
				// Extract text content from code element, handling rehype-pretty-code structure
				// Line numbers are added via CSS ::before, so they won't be in textContent
				const lines = codeElement.querySelectorAll(
					"[data-line], .line, span[class*='line']"
				);
				if (lines.length > 0) {
					// Extract text from each line element
					const textContent = Array.from(lines)
						.map((line) => {
							// Get text content, which excludes CSS pseudo-elements
							return line.textContent || "";
						})
						.join("\n")
						.trim();
					setCode(textContent || codeElement.textContent || "");
				} else {
					// Fallback: get all text content directly
					setCode(codeElement.textContent || "");
				}
			}
		}
	}

	const { children, ...restProps } = props;
	const language = (props as { "data-language"?: string })["data-language"];

	// Counted while rendering, so the server already sends long blocks
	// collapsed and nothing jumps when the page hydrates. A block whose fence
	// says `expanded` always shows in full.
	const lines = countLines(children);
	const expandedByAuthor = (props as { "data-expanded"?: unknown })["data-expanded"] !== undefined;
	const collapsible = lines > COLLAPSE_OVER && !expandedByAuthor;
	const [open, setOpen] = useState(false);
	const block = useRef<HTMLDivElement>(null);
	const id = useId();

	const toggle = () => {
		const closing = open;
		setOpen(!open);
		// Closing a long block from its bottom would leave the reader far below
		// it, so bring its top back into view.
		const top = block.current?.getBoundingClientRect().top ?? 0;
		if (closing && top < 0) {
			const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			block.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
		}
	};

	return (
		<div
			ref={block}
			className="code-block not-prose"
			data-collapsed={collapsible && !open ? "" : undefined}
		>
			<div className="code-head">
				<span>{language && language !== "plaintext" ? language : "code"}</span>
				<CopyButton code={code} inline />
			</div>
			<pre {...restProps} id={id} ref={extractCode}>
				{children}
			</pre>
			{collapsible && (
				<button type="button" className="code-more" aria-expanded={open} aria-controls={id} onClick={toggle}>
					{open ? "Show less ↑" : `Show all ${lines} lines ↓`}
				</button>
			)}
		</div>
	);
}
