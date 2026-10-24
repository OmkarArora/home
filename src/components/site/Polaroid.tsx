import Image from "next/image";

import { mono } from "./ui";

/**
 * The polaroid every photo on the site sits in: the home page's stack, the
 * About wall and the picture that follows the hover list. One frame, two sizes
 * (`lg` for the stack, `sm` for the rest); how a polaroid moves is up to
 * whoever holds it.
 */
export function Polaroid({
	size = "sm",
	caption,
	className = "",
	children,
}: {
	size?: "lg" | "sm";
	caption?: React.ReactNode;
	className?: string;
	/** What's in the frame: a `PolaroidPhoto`, or any face of the same shape. */
	children: React.ReactNode;
}) {
	return (
		<figure
			className={`flex flex-col border border-[var(--line)] bg-[#fafaf5] shadow-[0_10px_30px_rgb(0_0_0/0.18)] ${size === "lg" ? "p-3" : "p-2"} ${className}`}
		>
			{children}
			{caption && (
				<figcaption
					className={`${mono} flex items-center justify-between gap-2 text-[#0c0c0d] ${size === "lg" ? "h-11 pt-1 text-sm" : "pt-2 pb-0.5 text-xs leading-snug"}`}
				>
					{caption}
				</figcaption>
			)}
		</figure>
	);
}

/** A photo filling the frame. Drawings on white (`contain`) sit whole on a white mat instead of cropped. */
export function PolaroidPhoto({
	src,
	alt,
	contain = false,
	sizes,
	className = "",
}: {
	src: string;
	alt: string;
	contain?: boolean;
	/** The width it shows at, for the image optimiser. */
	sizes: string;
	className?: string;
}) {
	return (
		<div className={`relative min-h-0 overflow-hidden ${contain ? "bg-white" : ""} ${className}`}>
			<Image
				src={src}
				alt={alt}
				fill
				sizes={sizes}
				draggable={false}
				className={contain ? "object-contain p-1.5" : "object-cover"}
			/>
		</div>
	);
}
