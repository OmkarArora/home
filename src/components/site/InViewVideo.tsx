"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted, looping clip that loads nothing until it nears the screen, then
 * plays while it is visible and pauses when it isn't; the poster shows until
 * then. Under reduced motion, or with data saver on, it never starts (or
 * downloads) by itself: it shows its controls and waits to be played.
 */
export function InViewVideo({
	src,
	poster,
	label,
	className,
	style,
}: {
	src: string;
	poster?: string;
	label: string;
	className?: string;
	style?: React.CSSProperties;
}) {
	const video = useRef<HTMLVideoElement>(null);
	const [near, setNear] = useState(false);
	const [visible, setVisible] = useState(false);
	const [still, setStill] = useState(false);

	useEffect(() => {
		const element = video.current;
		if (!element) return;
		const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
		setStill(saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches);

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setNear(true);
				setVisible(entry.isIntersecting);
			},
			{ rootMargin: "200px 0px" },
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	// Play only once the source is attached, which happens on the render after `near`.
	useEffect(() => {
		const element = video.current;
		if (!element || !near) return;
		if (visible && !still) element.play().catch(() => {});
		else element.pause();
	}, [near, visible, still]);

	return (
		<video
			ref={video}
			className={className}
			style={style}
			src={near ? src : undefined}
			poster={poster}
			aria-label={label}
			preload="none"
			muted
			loop
			playsInline
			controls={still}
		/>
	);
}
