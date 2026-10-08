"use client";

import { useEffect, useState } from "react";

/**
 * The time in Gurugram, ticking. Rendered empty on the server so the first
 * paint never disagrees with the client's clock.
 */
export function LocalTime({ className }: { className?: string }) {
	const [time, setTime] = useState<string | null>(null);

	useEffect(() => {
		const format = () =>
			new Date().toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
				timeZone: "Asia/Kolkata",
			});
		setTime(format());
		const timer = setInterval(() => setTime(format()), 15_000);
		return () => clearInterval(timer);
	}, []);

	return (
		<span className={className} suppressHydrationWarning>
			{time ?? "--:--"} IST
		</span>
	);
}
