"use client";

import React from "react";

type InteractiveDemoProps = {
	title?: string;
	description?: string;
	children: React.ReactNode;
};

export function InteractiveDemo({
	title,
	description,
	children,
}: InteractiveDemoProps) {
	return (
		<div className="my-6 border rounded-lg p-4 bg-muted/30">
			{(title || description) && (
				<div className="mb-4 space-y-1">
					{title && (
						<h4 className="text-sm font-semibold text-foreground">{title}</h4>
					)}
					{description && (
						<p className="text-xs text-muted-foreground">{description}</p>
					)}
				</div>
			)}
			<div>{children}</div>
		</div>
	);
}
