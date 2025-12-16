"use client";

import { useState } from "react";

async function fakeToggleLikeApi(nextValue: boolean) {
	await new Promise((resolve) => setTimeout(resolve, 800));
	if (Math.random() < 0.2) {
		throw new Error("Failed to update like. Please try again.");
	}
	return nextValue;
}

export function OptimisticLikeDemo() {
	const [isLiked, setIsLiked] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleToggle() {
		if (isPending) return;

		setError(null);
		const previous = isLiked;
		const next = !isLiked;

		setIsLiked(next);
		setIsPending(true);

		try {
			await fakeToggleLikeApi(next);
		} catch (err) {
			setIsLiked(previous);
			setError((err as Error).message);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="inline-flex flex-col items-start gap-2 text-sm">
			<button
				onClick={handleToggle}
				disabled={isPending}
				className={`rounded-full border px-3 py-1 text-xs md:text-sm transition-colors ${
					isLiked
						? "bg-blue-600 text-white border-blue-700"
						: "bg-background text-foreground hover:bg-muted"
				} disabled:opacity-60`}
			>
				{isLiked ? "❤️ Liked" : "🤍 Like"}
				{isPending && <span className="ml-2 opacity-80">Saving…</span>}
			</button>
			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
