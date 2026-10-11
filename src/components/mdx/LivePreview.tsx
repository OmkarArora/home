"use client";

import { ReactNode } from "react";
import { CopyButton } from "./copy-button";
import { DemoFrame, paneLabel } from "./DemoFrame";

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
		<DemoFrame tag="Live" title={title} description={description}>
			{showCode && (
				<div className="group relative border-b border-foreground bg-muted/40">
					<div className="flex items-center justify-between border-b border-border px-4 py-1.5">
						<span className={paneLabel}>Code</span>
						<CopyButton code={code} inline />
					</div>
					<pre className="overflow-x-auto rounded-none border-0 bg-transparent p-4">
						<code className="bg-transparent p-0 font-mono text-sm">{code}</code>
					</pre>
				</div>
			)}

			<div className="p-6 bg-background">
				<p className={`${paneLabel} mb-3`}>Preview</p>
				<div className="min-h-[100px] flex items-center justify-center">
					{preview}
				</div>
			</div>
		</DemoFrame>
	);
}
