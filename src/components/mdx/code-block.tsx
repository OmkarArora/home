"use client";

import { useState } from "react";
import { CopyButton } from "./copy-button";

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

	// Extract children and className from props to avoid conflicts
	const { children, className: propsClassName, ...restProps } = props;
	const className = propsClassName ? `${propsClassName} group` : "group";

	return (
		<pre {...restProps} ref={extractCode} className={className}>
			{code && <CopyButton code={code} />}
			{children}
		</pre>
	);
}
