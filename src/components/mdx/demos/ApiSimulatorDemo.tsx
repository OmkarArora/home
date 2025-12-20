"use client";

import { useState } from "react";

export function ApiSimulatorDemo() {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const simulateApiCall = async (shouldFail: boolean = false) => {
		setLoading(true);
		setError(null);
		setData(null);

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1500));

		if (shouldFail) {
			setError("Failed to fetch data. Please try again.");
			setLoading(false);
			return;
		}

		setData("Successfully fetched data!");
		setLoading(false);
	};

	return (
		<div className="max-w-md mx-auto space-y-4">
			<div className="flex gap-2">
				<button
					onClick={() => simulateApiCall(false)}
					disabled={loading}
					className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
				>
					{loading ? "Loading..." : "Fetch Data"}
				</button>
				<button
					onClick={() => simulateApiCall(true)}
					disabled={loading}
					className="flex-1 px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
				>
					Simulate Error
				</button>
			</div>

			{loading && (
				<div className="p-4 rounded-lg bg-muted/50 border border-border">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
						<p className="text-sm text-muted-foreground">Loading...</p>
					</div>
				</div>
			)}

			{data && (
				<div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
					<p className="text-sm font-medium text-primary">{data}</p>
				</div>
			)}

			{error && (
				<div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
					<p className="text-sm font-medium text-destructive">{error}</p>
				</div>
			)}
		</div>
	);
}
