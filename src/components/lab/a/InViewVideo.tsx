"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted, looping clip that loads nothing until it nears the screen, then
 * plays while it is visible and pauses when it isn't. Under reduced motion it
 * never starts by itself: it shows its controls and waits to be played.
 */
export function InViewVideo({
	src,
	label,
	className,
	style,
}: {
	src: string;
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
		setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

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
			aria-label={label}
			preload="none"
			muted
			loop
			playsInline
			controls={still}
		/>
	);
}
