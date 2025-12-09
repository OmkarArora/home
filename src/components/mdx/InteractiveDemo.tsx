"use client";

import { ReactNode } from "react";

interface InteractiveDemoProps {
	children: ReactNode;
	title?: string;
	description?: string;
	className?: string;
}

export function InteractiveDemo({
	children,
	title,
	description,
	className = "",
}: InteractiveDemoProps) {
	return (
		<div
			className={`my-8 border border-border rounded-lg overflow-hidden ${className}`}
		>
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
			<div className="p-6 bg-background">{children}</div>
		</div>
	);
}
