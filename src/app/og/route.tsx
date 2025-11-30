import { getPostBySlug } from "@/lib/posts";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET(request: Request) {
	let url = new URL(request.url);
	let slug = url.searchParams.get("slug");

	// Construct the image URLs
	const origin = url.origin;
	const profileImageUrl = `${origin}/images/profile.jpg`;
	const faviconUrl = `${origin}/images/favicon-32x32.png`;

	// Fetch the profile image
	const profileImageResponse = await fetch(profileImageUrl);
	const profileImageBuffer = await profileImageResponse.arrayBuffer();
	const profileImageBase64 = Buffer.from(profileImageBuffer).toString("base64");
	const profileImageDataUrl = `data:image/jpeg;base64,${profileImageBase64}`;

	// Fetch the favicon
	const faviconResponse = await fetch(faviconUrl);
	const faviconBuffer = await faviconResponse.arrayBuffer();
	const faviconBase64 = Buffer.from(faviconBuffer).toString("base64");
	const faviconDataUrl = `data:image/png;base64,${faviconBase64}`;

	let postTitle = "Next.js Portfolio Starter";

	if (!slug) return new Response("Slug is required", { status: 400 });

	// Prefer slug as it's more reliable and consistent with blog URLs

	const post = await getPostBySlug(slug);

	if (!post) return new Response("Post not found", { status: 404 });

	postTitle = post.metadata.title;

	// Load Inter fonts from file system (TTF format for best performance)
	const interMedium = await readFile(
		join(process.cwd(), "public/fonts/Inter-Medium.ttf")
	);
	const interSemiBold = await readFile(
		join(process.cwd(), "public/fonts/Inter-SemiBold.ttf")
	);
	const interBold = await readFile(
		join(process.cwd(), "public/fonts/Inter-Bold.ttf")
	);
	const interExtraBold = await readFile(
		join(process.cwd(), "public/fonts/Inter-ExtraBold.ttf")
	);

	return new ImageResponse(
		(
			<div tw="flex flex-col w-full h-full bg-white relative p-16">
				{/* Top left header with favicon */}
				<div tw="flex absolute top-20 left-20"></div>

				{/* Title - left aligned, positioned below header */}
				<div tw="flex flex-1 items-start justify-start pt-10 pb-16">
					<div tw="flex flex-col">
						<img src={faviconDataUrl} tw="w-8 h-8" alt="Favicon" />

						<h1
							tw="text-7xl text-left leading-tight max-w-5xl"
							style={{
								fontFamily: "Inter",
								fontWeight: 700,
								color: "#000000",
								letterSpacing: "-0.02em",
							}}
						>
							{postTitle}
						</h1>
					</div>
				</div>

				{/* Bottom section with profile photo and name */}
				<div tw="flex items-center absolute bottom-16 left-16">
					{/* Profile Photo - Circular */}
					<div tw="flex w-20 h-20 rounded-full mr-4 overflow-hidden">
						<img src={profileImageDataUrl} tw="w-full h-full" alt="Profile" />
					</div>
					{/* Name */}
					<p
						tw="text-3xl"
						style={{
							fontFamily: "Inter",
							fontWeight: 600,
							color: "#1f2937",
							letterSpacing: "-0.01em",
						}}
					>
						Omkar Arora
					</p>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: "Inter",
					data: interMedium,
					style: "normal",
					weight: 500,
				},
				{
					name: "Inter",
					data: interSemiBold,
					style: "normal",
					weight: 600,
				},
				{
					name: "Inter",
					data: interBold,
					style: "normal",
					weight: 700,
				},
				{
					name: "Inter",
					data: interExtraBold,
					style: "normal",
					weight: 800,
				},
			],
		}
	);
}
