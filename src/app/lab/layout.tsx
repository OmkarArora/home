import type { Metadata } from "next";

/**
 * The design lab: version A of the redesign, before it replaces the live site.
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
