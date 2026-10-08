import type { Metadata } from "next";

/**
 * The design lab: three candidate home pages, side by side.
 *
 * Kept out of search on purpose — these are drafts with placeholder content,
 * and the sitemap does not list them either.
 */
export const metadata: Metadata = {
	title: "Design lab — Omkar Arora",
	robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
	return children;
}
