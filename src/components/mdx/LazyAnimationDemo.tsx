"use client";

import dynamic from "next/dynamic";

const AnimationDemoLazy = dynamic(
	async () => {
		// Artificial delay so the loading state is visible
		await new Promise((resolve) => setTimeout(resolve, 800));
		const mod = await import("./demos/AnimationDemo");
		return mod.AnimationDemo;
	},
	{
		loading: () => (
			<div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
				<div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				<p className="text-sm font-medium text-muted-foreground">
					Loading animation demo...
				</p>
				<p className="text-xs text-muted-foreground/80">
					This component loads on demand to keep the page fast.
				</p>
			</div>
		),
	}
);

export function LazyAnimationDemo() {
	return <AnimationDemoLazy />;
}
