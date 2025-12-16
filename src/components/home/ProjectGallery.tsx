"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel";
import { waitUntil } from "@/lib/utils";

export type ProjectSlug =
	| "openvy"
	| "remail"
	| "jupitun"
	| "portfolio"
	| "team-resume-builder"
	| "highlight-extension";

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
	jupitun: [],
	portfolio: [],
	"team-resume-builder": [
		"/images/projects/team-resume-builder/screenshot1.webp",
		"/images/projects/team-resume-builder/screenshot2.webp",
		"/images/projects/team-resume-builder/screenshot3.webp",
		"/images/projects/team-resume-builder/screenshot4.webp",
	],
	"highlight-extension": [],
};

type ProjectGalleryProps = {
	project: ProjectSlug;
};

export function ProjectGallery({ project }: ProjectGalleryProps) {
	const images = PROJECT_IMAGES[project];
	const [open, setOpen] = useState(false);
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		setCurrent(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	useEffect(() => {
		if (!api || !open) {
			return;
		}
		api.scrollTo(selectedIndex);
	}, [api, selectedIndex, open]);

	if (!images?.length) return null;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) {
					waitUntil(300).then(() => {
						setSelectedIndex(0);
					});
				}
			}}
		>
			<div className="mb-6">
				<div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
					<div className="flex gap-3 min-w-max">
						{images.map((src, i) => (
							<DialogTrigger key={src} asChild>
								<button
									type="button"
									onClick={() => {
										setSelectedIndex(i);
									}}
									className="group relative h-32 w-48 flex-shrink-0 overflow-hidden rounded-md border border-border/70 bg-muted/40 transition-all hover:border-border hover:shadow-md"
									aria-label={`View screenshot ${i + 1}`}
								>
									<Image
										src={src}
										alt={`${project} screenshot ${i + 1}`}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-105"
										sizes="192px"
										quality={100}
									/>
								</button>
							</DialogTrigger>
						))}
					</div>
				</div>
			</div>

			<DialogContent className="p-0 max-w-[95vw] sm:max-w-[90vw] h-[95vh] max-h-[95vh] w-full flex flex-col">
				<div className="relative flex h-full w-full flex-col overflow-hidden rounded-lg bg-background shadow-2xl">
					<header className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6 flex-shrink-0">
						<div>
							<p className="text-sm font-medium capitalize">{project}</p>
							<p className="text-xs text-muted-foreground">
								{current} / {images.length}
							</p>
						</div>
					</header>

					<main className="relative flex flex-1 items-center justify-center bg-muted/40 min-h-0 overflow-hidden">
						<Carousel
							setApi={setApi}
							opts={{
								align: "center",
								loop: true,
							}}
							className="w-full h-full [&_[data-slot=carousel-content]]:h-full"
						>
							<CarouselContent className="-ml-0 h-full [&>div]:h-full">
								{images.map((src, index) => (
									<CarouselItem
										key={src}
										className="pl-0 basis-full h-full flex items-center justify-center"
									>
										<div className="relative w-full h-full flex items-center justify-center p-4">
											<div className="relative w-full h-full drop-shadow-2xl">
												<Image
													src={src}
													alt={`${project} screenshot ${index + 1}`}
													fill
													className="object-contain"
													sizes="(max-width: 768px) 95vw, 90vw"
													priority={index === selectedIndex}
													quality={100}
													draggable={false}
												/>
											</div>
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-4 border-border/70 bg-background/90 hover:bg-background" />
							<CarouselNext className="right-4 border-border/70 bg-background/90 hover:bg-background" />
						</Carousel>
					</main>

					<footer className="border-t border-border/60 px-4 py-3 sm:px-6 flex-shrink-0">
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
											idx + 1 === current
												? "w-4 bg-foreground"
												: "w-1.5 bg-border"
										}`}
										onClick={() => api?.scrollTo(idx)}
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
