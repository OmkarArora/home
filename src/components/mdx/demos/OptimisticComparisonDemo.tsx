"use client";

import { useState } from "react";

async function fakeApiCall() {
	await new Promise((resolve) => setTimeout(resolve, 1500));
}

export function OptimisticComparisonDemo() {
	const [optimisticCount, setOptimisticCount] = useState(0);
	const [optimisticPending, setOptimisticPending] = useState(false);
	const [pessimisticCount, setPessimisticCount] = useState(0);
	const [pessimisticPending, setPessimisticPending] = useState(false);

	async function handleOptimistic() {
		if (optimisticPending) return;
		const previous = optimisticCount;
		setOptimisticCount(previous + 1);
		setOptimisticPending(true);
		try {
			await fakeApiCall();
		} catch {
			setOptimisticCount(previous);
		} finally {
			setOptimisticPending(false);
		}
	}

	async function handlePessimistic() {
		if (pessimisticPending) return;
		setPessimisticPending(true);
		try {
			await fakeApiCall();
			setPessimisticCount((prev) => prev + 1);
		} finally {
			setPessimisticPending(false);
		}
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
			<div className="border rounded-lg p-4 bg-muted/30 space-y-3">
				<h3 className="font-semibold text-xs md:text-sm">
					With Optimistic Update
				</h3>
				<div className="flex items-center gap-3">
					<button
						onClick={handleOptimistic}
						disabled={optimisticPending}
						className="rounded-md bg-primary px-3 py-1 text-xs md:text-sm text-primary-foreground disabled:opacity-60"
					>
						Increment
					</button>
					<span className="text-xs md:text-sm">
						Count: <strong>{optimisticCount}</strong>
					</span>
					{optimisticPending && (
						<span className="text-[10px] text-muted-foreground">
							(Syncing…)
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground">
					UI updates instantly, syncs in background
				</p>
			</div>
			<div className="border rounded-lg p-4 bg-muted/30 space-y-3">
				<h3 className="font-semibold text-xs md:text-sm">
					Without Optimistic Update
				</h3>
				<div className="flex items-center gap-3">
					<button
						onClick={handlePessimistic}
						disabled={pessimisticPending}
						className="rounded-md bg-primary px-3 py-1 text-xs md:text-sm text-primary-foreground disabled:opacity-60"
					>
						Increment
					</button>
					<span className="text-xs md:text-sm">
						Count: <strong>{pessimisticCount}</strong>
					</span>
					{pessimisticPending && (
						<span className="text-[10px] text-muted-foreground">
							(Loading…)
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground">
					UI waits for server response
				</p>
			</div>
		</div>
	);
}
