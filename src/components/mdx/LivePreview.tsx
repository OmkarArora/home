"use client";

import { useState, ReactNode } from "react";
import { CopyButton } from "./copy-button";

interface LivePreviewProps {
	code: string;
	preview: ReactNode;
	title?: string;
	description?: string;
	showCode?: boolean;
}

export function LivePreview({
	code,
	preview,
	title,
	description,
	showCode = true,
}: LivePreviewProps) {
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

			{showCode && (
				<div className="relative border-b border-border bg-muted/30">
					<div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
						<span className="text-xs font-medium text-muted-foreground">
							Code
						</span>
					</div>
					<div className="relative">
						<pre className="relative overflow-x-auto p-4 bg-transparent">
							<code className="text-sm font-mono">{code}</code>
							<CopyButton code={code} />
						</pre>
					</div>
				</div>
			)}

			<div className="p-6 bg-background">
				<div className="flex items-center justify-between mb-3">
					<span className="text-xs font-medium text-muted-foreground">
						Preview
					</span>
				</div>
				<div className="min-h-[100px] flex items-center justify-center">
					{preview}
				</div>
			</div>
		</div>
	);
}
