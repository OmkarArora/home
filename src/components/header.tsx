"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
	const pathname = usePathname();
	const isHomePage = pathname === "/";

	return (
		<header className="border-b border-border/40">
			<div className="max-w-4xl mx-auto px-6 py-6">
				<nav className="flex items-center justify-between">
					<Link
						href="/"
						className="text-xl font-semibold hover:text-primary transition-colors"
					>
						omkar
					</Link>
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-6 text-sm text-muted-foreground">
							<Link
								href={isHomePage ? "#work" : "/#work"}
								className="hover:text-foreground transition-colors"
							>
								work
							</Link>
							<Link
								href={isHomePage ? "#projects" : "/#projects"}
								className="hover:text-foreground transition-colors"
							>
								projects
							</Link>
							<Link
								href="/blog"
								className="hover:text-foreground transition-colors"
							>
								blog
							</Link>
							<Link
								href={isHomePage ? "#contact" : "/#contact"}
								className="hover:text-foreground transition-colors"
							>
								contact
							</Link>
						</div>
						<ModeToggle />
					</div>
				</nav>
			</div>
		</header>
	);
}
