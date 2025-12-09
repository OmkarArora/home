"use client";

import { useState, useMemo } from "react";
import { CopyButton } from "./copy-button";

interface CodePlaygroundProps {
	initialCode: string;
	title?: string;
	description?: string;
	language?: string;
}

export function CodePlayground({
	initialCode,
	title,
	description,
	language = "javascript",
}: CodePlaygroundProps) {
	const [code, setCode] = useState(initialCode);
	const [output, setOutput] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [isRunning, setIsRunning] = useState(false);

	const handleRun = () => {
		setIsRunning(true);
		setError(null);
		setOutput("");

		try {
			// Create a safe execution context
			const scope = {
				console: {
					log: (...args: unknown[]) => {
						setOutput((prev) => prev + args.map(String).join(" ") + "\n");
					},
					error: (...args: unknown[]) => {
						setError(args.map(String).join(" "));
					},
				},
			};

			// Wrap code in a function
			const wrappedCode = `
				(function() {
					const { console } = arguments[0];
					${code}
				})
			`;

			const result = eval(wrappedCode)(scope);
			if (result !== undefined) {
				setOutput((prev) => prev + String(result) + "\n");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsRunning(false);
		}
	};

	const handleReset = () => {
		setCode(initialCode);
		setOutput("");
		setError(null);
	};

	return (
		<div className="my-8 border border-border rounded-lg overflow-hidden">
			{(title || description) && (
				<div className="px-4 py-3 border-b border-border bg-muted/50">
					{title && (
						<h4 className="text-sm font-semibold text-foreground mb-1">
							{title}
						</h4>
					)}
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
				</div>
			)}

			{/* Code Editor */}
			<div className="border-b border-border bg-muted/30">
				<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
					<span className="text-xs font-medium text-muted-foreground">
						Editor ({language})
					</span>
					<div className="flex items-center gap-2">
						<button
							onClick={handleReset}
							className="text-xs px-2 py-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
						>
							Reset
						</button>
						<button
							onClick={handleRun}
							disabled={isRunning}
							className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
						>
							{isRunning ? "Running..." : "Run"}
						</button>
					</div>
				</div>
				<div className="relative">
					<textarea
						value={code}
						onChange={(e) => setCode(e.target.value)}
						className="w-full min-h-[200px] p-4 font-mono text-sm bg-transparent text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
						spellCheck={false}
						placeholder="Enter your code here..."
					/>
				</div>
			</div>

			{/* Output */}
			{(output || error) && (
				<div className="p-4 bg-background border-b border-border">
					<div className="flex items-center justify-between mb-2">
						<span className="text-xs font-medium text-muted-foreground">
							Output
						</span>
					</div>
					{error ? (
						<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
							<p className="text-sm font-medium text-destructive mb-1">Error</p>
							<p className="text-sm text-destructive/80 font-mono whitespace-pre-wrap">
								{error}
							</p>
						</div>
					) : (
						<pre className="p-3 rounded-lg bg-muted/50 border border-border overflow-x-auto">
							<code className="text-sm font-mono text-foreground whitespace-pre-wrap">
								{output || "No output"}
							</code>
						</pre>
					)}
				</div>
			)}
		</div>
	);
}
