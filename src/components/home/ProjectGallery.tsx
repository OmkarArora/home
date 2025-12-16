"use client";

import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ProjectSlug = "openvy" | "remail";

const PROJECT_IMAGES: Record<ProjectSlug, string[]> = {
	openvy: [
		"/images/projects/openvy/screenshot1.webp",
		"/images/projects/openvy/screenshot2.webp",
		"/images/projects/openvy/screenshot3.webp",
		"/images/projects/openvy/screenshot4.webp",
		"/images/projects/openvy/screenshot5.webp",
	],
	remail: [
		"/images/projects/remail/screenshot1.webp",
		"/images/projects/remail/screenshot2.webp",
		"/images/projects/remail/screenshot3.webp",
	],
};

type ProjectGalleryProps = {
	project: ProjectSlug;
};

export function ProjectGallery({ project }: ProjectGalleryProps) {
	const images = PROJECT_IMAGES[project];
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);

	const goTo = (index: number) => {
		const total = images.length;
		const next = (index + total) % total;
		setActiveIndex(next);
	};

	if (!images?.length) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) setActiveIndex(0);
			}}
		>
			<div className="mt-4 space-y-3">
				<div className="flex items-center justify-between">
					<p className="text-sm font-medium text-muted-foreground">
						Screenshots
					</p>
					<p className="text-xs text-muted-foreground">
						{images.length} image{images.length > 1 ? "s" : ""}
					</p>
				</div>

				<div className="relative">
					<DialogTrigger asChild>
						<button
							type="button"
							className="group relative w-full overflow-hidden rounded-md border border-border/70 bg-muted/40"
							aria-label="Open screenshots gallery"
						>
							<div className="flex gap-2 p-1">
								{images.slice(0, 3).map((src, i) => (
									<div
										key={src}
										className="relative h-24 flex-1 overflow-hidden rounded-sm"
									>
										<Image
											src={src}
											alt={`${project} screenshot ${i + 1}`}
											fill
											className="object-cover transition-transform duration-300 group-hover:scale-105"
											sizes="(max-width: 768px) 33vw, 120px"
										/>
										{i === 2 && images.length > 3 && (
											<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white backdrop-blur-sm">
												+{images.length - 2} more
											</div>
										)}
									</div>
								))}
							</div>
						</button>
					</DialogTrigger>
				</div>
			</div>

			<DialogContent className="p-0">
				<div className="relative flex h-full w-full max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-lg bg-background shadow-2xl">
					<header className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6">
						<div>
							<p className="text-sm font-medium capitalize">{project}</p>
							<p className="text-xs text-muted-foreground">
								{activeIndex + 1} / {images.length}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={() => setOpen(false)}
							aria-label="Close gallery"
						>
							<X className="h-4 w-4" />
						</Button>
					</header>

					<main className="relative flex flex-1 items-center justify-center bg-muted/40">
						<button
							type="button"
							className="absolute left-2 z-10 rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground shadow-sm backdrop-blur-sm transition hover:bg-background hover:text-foreground"
							onClick={() => goTo(activeIndex - 1)}
							aria-label="Previous image"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button
							type="button"
							className="absolute right-2 z-10 rounded-full border border-border/70 bg-background/90 p-1 text-muted-foreground shadow-sm backdrop-blur-sm transition hover:bg-background hover:text-foreground"
							onClick={() => goTo(activeIndex + 1)}
							aria-label="Next image"
						>
							<ChevronRight className="h-4 w-4" />
						</button>

						<div className="relative aspect-video w-full max-w-3xl">
							<Image
								key={images[activeIndex]}
								src={images[activeIndex]}
								alt={`${project} screenshot ${activeIndex + 1}`}
								fill
								className="object-contain"
								sizes="(max-width: 768px) 100vw, 70vw"
								priority
							/>
						</div>
					</main>

					<footer className="border-t border-border/60 px-4 py-3 sm:px-6">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>Use arrows or swipe to change slides.</span>
							</div>
							<div className="flex items-center gap-1.5">
								{images.map((_, idx) => (
									<button
										key={idx}
										type="button"
										className={`h-1.5 rounded-full transition-all ${
											idx === activeIndex
												? "w-4 bg-foreground"
												: "w-1.5 bg-border"
										}`}
										onClick={() => setActiveIndex(idx)}
										aria-label={`Go to image ${idx + 1}`}
									/>
								))}
							</div>
						</div>
					</footer>
				</div>
			</DialogContent>
		</Dialog>
	);
}
