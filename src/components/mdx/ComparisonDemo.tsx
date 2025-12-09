"use client";

import { useState, ReactNode } from "react";

interface ComparisonDemoProps {
	left: {
		title: string;
		content: ReactNode;
		code?: string;
	};
	right: {
		title: string;
		content: ReactNode;
		code?: string;
	};
	description?: string;
}

export function ComparisonDemo({
	left,
	right,
	description,
}: ComparisonDemoProps) {
	const [activeTab, setActiveTab] = useState<"left" | "right" | "both">("both");

	return (
		<div className="my-8 border border-border rounded-lg overflow-hidden">
			{description && (
				<div className="px-4 py-3 border-b border-border bg-muted/50">
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			)}

			<div className="flex border-b border-border bg-muted/30">
				<button
					onClick={() => setActiveTab("both")}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "both"
							? "bg-background text-foreground border-b-2 border-primary"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
					}`}
				>
					Both
				</button>
				<button
					onClick={() => setActiveTab("left")}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "left"
							? "bg-background text-foreground border-b-2 border-primary"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
					}`}
				>
					{left.title}
				</button>
				<button
					onClick={() => setActiveTab("right")}
					className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
						activeTab === "right"
							? "bg-background text-foreground border-b-2 border-primary"
							: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
					}`}
				>
					{right.title}
				</button>
			</div>

			<div className="p-6 bg-background">
				{activeTab === "both" && (
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h4 className="text-sm font-semibold text-foreground mb-3">
								{left.title}
							</h4>
							<div className="space-y-4">{left.content}</div>
							{left.code && (
								<details className="mt-4">
									<summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
										Show code
									</summary>
									<pre className="mt-2 p-3 rounded bg-muted/50 overflow-x-auto">
										<code className="text-xs font-mono">{left.code}</code>
									</pre>
								</details>
							)}
						</div>
						<div>
							<h4 className="text-sm font-semibold text-foreground mb-3">
								{right.title}
							</h4>
							<div className="space-y-4">{right.content}</div>
							{right.code && (
								<details className="mt-4">
									<summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
										Show code
									</summary>
									<pre className="mt-2 p-3 rounded bg-muted/50 overflow-x-auto">
										<code className="text-xs font-mono">{right.code}</code>
									</pre>
								</details>
							)}
						</div>
					</div>
				)}

				{activeTab === "left" && (
					<div>
						<h4 className="text-sm font-semibold text-foreground mb-4">
							{left.title}
						</h4>
						<div className="space-y-4">{left.content}</div>
						{left.code && (
							<details className="mt-4">
								<summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
									Show code
								</summary>
								<pre className="mt-2 p-3 rounded bg-muted/50 overflow-x-auto">
									<code className="text-xs font-mono">{left.code}</code>
								</pre>
							</details>
						)}
					</div>
				)}

				{activeTab === "right" && (
					<div>
						<h4 className="text-sm font-semibold text-foreground mb-4">
							{right.title}
						</h4>
						<div className="space-y-4">{right.content}</div>
						{right.code && (
							<details className="mt-4">
								<summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
									Show code
								</summary>
								<pre className="mt-2 p-3 rounded bg-muted/50 overflow-x-auto">
									<code className="text-xs font-mono">{right.code}</code>
								</pre>
							</details>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
