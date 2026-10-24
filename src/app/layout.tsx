import type { Metadata } from "next";

import "./globals.css";
import { baseUrl } from "@/app/sitemap";
import { ThemeProvider } from "@/components/theme-provider";
import { yearsOfExperience } from "@/content/profile";

export const metadata: Metadata = {
	metadataBase: new URL(baseUrl),
	title: "Omkar Arora — Senior Software Engineer",
	description: `Senior Software Engineer at ixigo, building for the web with React, Next.js and TypeScript. ${yearsOfExperience()}+ years of experience.`,
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
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased">
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
