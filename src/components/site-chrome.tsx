"use client";

import { usePathname } from "next/navigation";

/**
 * The site's header and footer, everywhere except the design lab.
 *
 * `/lab` pages are whole-page design experiments, each with its own nav and
 * footer, so the regular chrome would only sit on top of them. Delete this
 * (and render header and footer directly again) once the lab is gone.
 */
export function SiteChrome({
	header,
	footer,
	children,
}: {
	header: React.ReactNode;
	footer: React.ReactNode;
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	if (pathname.startsWith("/lab")) return <>{children}</>;

	return (
		<>
			{header}
			<main className="flex-1">{children}</main>
			{footer}
		</>
	);
}
