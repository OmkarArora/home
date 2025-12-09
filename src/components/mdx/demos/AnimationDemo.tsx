"use client";

import { useState } from "react";

export function AnimationDemo() {
	const [isAnimating, setIsAnimating] = useState(false);
	const [speed, setSpeed] = useState(1);

	return (
		<div className="max-w-md mx-auto space-y-4">
			<div className="flex items-center justify-center h-32 bg-muted/50 rounded-lg border border-border">
				<div
					className={`w-16 h-16 rounded-full bg-primary transition-all ${
						isAnimating ? "animate-bounce" : ""
					}`}
					style={{
						animationDuration: `${1 / speed}s`,
					}}
				/>
			</div>

			<div className="space-y-3">
				<div className="flex gap-2">
					<button
						onClick={() => setIsAnimating(!isAnimating)}
						className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
					>
						{isAnimating ? "Pause" : "Play"}
					</button>
					<button
						onClick={() => setIsAnimating(false)}
						className="px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
					>
						Reset
					</button>
				</div>

				<div>
					<label className="block text-sm font-medium text-foreground mb-2">
						Speed: {speed}x
					</label>
					<input
						type="range"
						min="0.5"
						max="3"
						step="0.5"
						value={speed}
						onChange={(e) => setSpeed(parseFloat(e.target.value))}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-muted-foreground mt-1">
						<span>0.5x</span>
						<span>3x</span>
					</div>
				</div>
			</div>
		</div>
	);
}
