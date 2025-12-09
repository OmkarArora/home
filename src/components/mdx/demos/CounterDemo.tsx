"use client";

import { useState } from "react";

export function CounterDemo() {
	const [count, setCount] = useState(0);

	return (
		<div className="flex flex-col items-center gap-4 p-6">
			<div className="text-4xl font-bold text-foreground">{count}</div>
			<div className="flex gap-2">
				<button
					onClick={() => setCount(count - 1)}
					className="px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
				>
					Decrement
				</button>
				<button
					onClick={() => setCount(0)}
					className="px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
				>
					Reset
				</button>
				<button
					onClick={() => setCount(count + 1)}
					className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
				>
					Increment
				</button>
			</div>
		</div>
	);
}
