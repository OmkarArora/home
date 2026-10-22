import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";

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
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<div className="min-h-screen bg-background text-foreground flex flex-col">
						<SiteChrome header={<Header />} footer={<Footer />}>
							{children}
						</SiteChrome>
					</div>
				</ThemeProvider>
			</body>
		</html>
	);
}
