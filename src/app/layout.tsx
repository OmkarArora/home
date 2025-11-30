import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Omkar Arora - Frontend Engineer",
	description:
		"Frontend Engineer specializing in React.js, Next.js, and TypeScript. Building scalable, high-performance web applications with 4+ years of experience.",
	keywords: [
		"Frontend Engineer",
		"React.js",
		"Next.js",
		"TypeScript",
		"Web Development",
		"UI/UX",
		"Motion",
		"Framer Motion",
	],
	authors: [{ name: "Omkar Arora" }],
	creator: "Omkar Arora",
	icons: {
		icon: [
			{ url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [
			{
				url: "/images/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
		other: [
			{
				rel: "android-chrome-192x192",
				url: "/images/android-chrome-192x192.png",
			},
			{
				rel: "android-chrome-512x512",
				url: "/images/android-chrome-512x512.png",
			},
		],
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			{/* <head>
				<link rel="icon" type="image/x-icon" href="/favicon.ico" />
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/images/favicon-16x16.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/images/favicon-32x32.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/images/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="192x192"
					href="/images/android-chrome-192x192.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="512x512"
					href="/images/android-chrome-512x512.png"
				/>
			</head> */}
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="min-h-screen bg-background text-foreground">
						<Header />
						{children}
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
