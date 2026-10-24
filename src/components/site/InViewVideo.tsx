"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted, looping clip shown over its poster. It plays by itself, but only
 * once the page has finished loading and gone idle, and the clip is at least
 * half on screen; it pauses when it leaves. Nothing downloads before then, so
 * it never slows the page down.
 *
 * Under reduced motion, or with data saver on, it never starts (or downloads)
 * by itself: it shows its controls and waits to be played.
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
	const [still, setStill] = useState(false);
	/** The page has loaded and gone quiet. */
	const [settled, setSettled] = useState(false);
	const [visible, setVisible] = useState(false);
	/** The source is attached; once it is, it stays. */
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
		setStill(saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches);

		// Wait for the page's own load, then for the browser to go idle.
		const idle = () => {
			if ("requestIdleCallback" in window) window.requestIdleCallback(() => setSettled(true), { timeout: 2000 });
			else setTimeout(() => setSettled(true), 500);
		};
		if (document.readyState === "complete") idle();
		else window.addEventListener("load", idle, { once: true });

		const element = video.current;
		const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
		if (element) observer.observe(element);
		return () => {
			observer.disconnect();
			window.removeEventListener("load", idle);
		};
	}, []);

	// Attach the source once the page has settled and the clip is in view. With
	// preload="none", a clip that won't play by itself still downloads nothing
	// until its play button is pressed.
	useEffect(() => {
		if (settled && visible) setLoaded(true);
	}, [settled, visible]);

	// Play only once the source is attached, which happens on the render after `loaded`.
	useEffect(() => {
		const element = video.current;
		if (!element || !loaded) return;
		if (visible && !still) element.play().catch(() => {});
		else element.pause();
	}, [loaded, visible, still]);

	return (
		<video
			ref={video}
			className={className}
			style={style}
			src={loaded ? src : undefined}
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
