"use client";

import { DemoFrame, tabClass } from "./DemoFrame";
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
	if (!left || !right) {
		return null;
	}

	const [activeTab, setActiveTab] = useState<"left" | "right" | "both">("both");

	return (
		<DemoFrame tag="Compare" description={description}>
			<div className="flex border-b border-border bg-muted/40">
				<button onClick={() => setActiveTab("both")} className={tabClass(activeTab === "both")}>
					Both
				</button>
				<button onClick={() => setActiveTab("left")} className={tabClass(activeTab === "left")}>
					{left.title}
				</button>
				<button onClick={() => setActiveTab("right")} className={tabClass(activeTab === "right")}>
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
		</DemoFrame>
	);
}
