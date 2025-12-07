"use client";

import { useState, useRef, useEffect } from "react";

export function CopyButton({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);

			// Clear any existing timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Reset after 2 seconds
			timeoutRef.current = setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<button
			onClick={copyToClipboard}
			className="absolute top-2 right-2 p-2 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
			aria-label={copied ? "Copied!" : "Copy code"}
			title={copied ? "Copied!" : "Copy code"}
		>
			{copied ? (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 13l4 4L19 7"
					/>
				</svg>
			) : (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
			)}
		</button>
	);
}
