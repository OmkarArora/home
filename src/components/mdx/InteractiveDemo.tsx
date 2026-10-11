"use client";

import { ReactNode } from "react";
import { DemoFrame } from "./DemoFrame";

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
		<DemoFrame title={title} description={description} className={className}>
			<div className="p-6 bg-background">{children}</div>
		</DemoFrame>
	);
}
