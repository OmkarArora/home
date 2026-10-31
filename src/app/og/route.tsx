import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { shortDate } from "@/components/site/data";
import { identity } from "@/content/profile";
import { getPostBySlug, readingTime } from "@/lib/posts";

/**
 * The image a link to the site shows when shared: `?slug=` for a post,
 * `?page=` for any other page.
 */

type Card = { kicker: string; title: string; mark?: string; sub?: string };

/** Each page's card says what its own heading says. */
const pages: Record<string, Card> = {
	home: { kicker: `${identity.title} · ${identity.company}`, title: "Web that feels magical", mark: "magical", sub: identity.name },
	work: { kicker: "Work · newest first", title: "Patch notes.", sub: "What I've shipped at ixigo and Sparklin." },
	projects: { kicker: "Projects · built for fun", title: "Side quests.", sub: "Games, tools and this site." },
	blog: { kicker: "Writing", title: "Dev log.", sub: "Notes on building for the web, with demos." },
	about: { kicker: `About · ${identity.location}`, title: "Off the clock.", sub: identity.name },
	history: { kicker: "This site", title: "Version history.", sub: "Every version of this site, newest first." },
	arcade: { kicker: "Arcade · insert coin", title: "Omkar's Arcade.", sub: "The site's tricks, playable on a cabinet under a night sky." },
};

const color = {
	paper: "#f3f3ee",
	ink: "#0c0c0d",
	dim: "#6b6b66",
	lime: "#c6f03a",
};

// Each path is written out in full so the deploy's file tracer ships exactly these files.
const read = {
	photo: () => readFile(join(process.cwd(), "public/images/omkar-fuji.jpg")),
	display: () => readFile(join(process.cwd(), "public/fonts/bricolage-grotesque-latin-800-normal.woff")),
	mono: () => readFile(join(process.cwd(), "public/fonts/jetbrains-mono-latin-400-normal.woff")),
	monoBold: () => readFile(join(process.cwd(), "public/fonts/jetbrains-mono-latin-700-normal.woff")),
};

async function cardFor(url: URL): Promise<Card | undefined> {
	const slug = url.searchParams.get("slug");
	if (slug) {
		const post = await getPostBySlug(slug);
		if (!post) return undefined;
		const { title, publishedAt } = post.metadata;
		return { kicker: `Dev log · ${readingTime(post.content)} min read · ${shortDate(publishedAt)}`, title, sub: identity.name };
	}
	const page = url.searchParams.get("page") ?? "home";
	return Object.prototype.hasOwnProperty.call(pages, page) ? pages[page] : undefined;
}

/** The title, with one word on a lime block like the home page's "magical". */
function Title({ card, size, ink }: { card: Card; size: number; ink: string }) {
	const words = card.title.split(" ");
	return (
		<div style={{ display: "flex", flexWrap: "wrap", fontFamily: "Bricolage", fontSize: size, lineHeight: 0.95, letterSpacing: "-0.035em", color: ink }}>
			{words.map((word, i) => {
				const marked = card.mark && word.replace(/\W/g, "") === card.mark;
				return (
					<span
						key={i}
						style={{
							display: "flex",
							marginRight: size * 0.22,
							...(marked ? { background: color.lime, color: color.ink, padding: `0 ${size * 0.08}px` } : {}),
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
}

function Kicker({ text, ink }: { text: string; ink: string }) {
	return (
		<div style={{ display: "flex", fontFamily: "Mono", fontSize: 22, letterSpacing: "0.16em", textTransform: "uppercase", color: ink }}>
			{text}
		</div>
	);
}

/** The Lime O and the address. */
function Sign({ ink }: { ink: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", fontFamily: "Mono", fontWeight: 700, fontSize: 22, letterSpacing: "0.08em", color: ink }}>
			<div style={{ display: "flex", width: 30, height: 30, background: color.lime, borderRadius: 7, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
				<div style={{ display: "flex", width: 18, height: 18, borderRadius: 9, border: `5px solid ${color.ink}` }} />
			</div>
			OMKARARORA.COM
		</div>
	);
}

/** Paper, an ink frame, and the photo as a tile on a lime backing, like a sticker. */
function Tile({ card, photo }: { card: Card; photo: string }) {
	return (
		<div style={{ display: "flex", width: "100%", height: "100%", background: color.paper, padding: 28 }}>
			<div style={{ display: "flex", flex: 1, border: `4px solid ${color.ink}`, padding: "44px 48px", position: "relative" }}>
				<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
					<Kicker text={card.kicker} ink={color.dim} />
					<div style={{ display: "flex", flexDirection: "column" }}>
						<Title card={card} size={card.title.length > 40 ? 60 : 88} ink={color.ink} />
						{card.sub && <div style={{ display: "flex", marginTop: 22, fontFamily: "Mono", fontSize: 24, color: color.dim }}>{card.sub}</div>}
					</div>
					<Sign ink={color.ink} />
				</div>
				<div style={{ display: "flex", position: "absolute", right: 56, top: 112, width: 300, height: 300, background: color.lime, transform: "rotate(3deg)" }} />
				<div style={{ display: "flex", position: "absolute", right: 72, top: 96, width: 300, height: 300, border: `4px solid ${color.ink}`, overflow: "hidden", transform: "rotate(-2deg)" }}>
					<img src={photo} width={292} height={292} style={{ objectFit: "cover", transform: "scale(1.6)", objectPosition: "48% 52%" }} alt="" />
				</div>
			</div>
		</div>
	);
}

export async function GET(request: Request) {
	const url = new URL(request.url);
	const card = await cardFor(url);
	if (!card) return new Response("Not found", { status: 404 });

	const [photo, display, mono, monoBold] = await Promise.all([
		read.photo().then((photo) => `data:image/jpeg;base64,${photo.toString("base64")}`),
		read.display(),
		read.mono(),
		read.monoBold(),
	]);

	return new ImageResponse(<Tile card={card} photo={photo} />, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Bricolage", data: display, weight: 800, style: "normal" },
			{ name: "Mono", data: mono, weight: 400, style: "normal" },
			{ name: "Mono", data: monoBold, weight: 700, style: "normal" },
		],
	});
}
