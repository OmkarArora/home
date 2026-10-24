import Link from "next/link";

import { PageHead, mono } from "./ui";

const button = `${mono} px-4 py-3 text-xs font-bold uppercase tracking-wider`;

/** The 404 page's content. Unknown URLs get it inside a `SiteFrame`; a missing post, inside the site's layout. */
export function NotFound() {
	return (
		<>
			<PageHead kicker="Error 404" title="Nothing at this address.">
				It may have moved when the site was redesigned in October 2026.
			</PageHead>
			<div className="flex flex-wrap gap-3 pb-16">
				<Link href="/" className={`${button} bg-[var(--lime)] text-[#0c0c0d]`}>
					Home
				</Link>
				<Link href="/blog" className={`${button} border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--bg)]`}>
					Writing
				</Link>
			</div>
		</>
	);
}
