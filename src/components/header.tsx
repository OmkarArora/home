"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useRef } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Logo2026 } from "@/components/logo-2026";
import { launchConfetti } from "@/components/easter-egg-2026";

export function Header() {
	const pathname = usePathname();
	const isHomePage = pathname === "/";
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const logoRef = useRef<HTMLAnchorElement>(null);
	const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Check if it's January 2026
	const now = new Date();
	const isJanuary2026 = now.getFullYear() === 2026 && now.getMonth() === 0; // 0 = January

	const navLinks = [
		{ href: isHomePage ? "#projects" : "/#projects", label: "projects" },
		{ href: "/blog", label: "blog" },
		{ href: isHomePage ? "#work" : "/#work", label: "work" },
		{ href: isHomePage ? "#contact" : "/#contact", label: "contact" },
	];

	const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (isJanuary2026) {
			// Clear any pending single-click navigation
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
				clickTimeoutRef.current = null;

				// This was a double-click, trigger confetti
				e.preventDefault();
				launchConfetti();
				return;
			}

			// Wait to see if this is a double-click
			clickTimeoutRef.current = setTimeout(() => {
				clickTimeoutRef.current = null;
				// Single click - allow normal navigation
			}, 300); // 300ms delay to detect double-click
		}
	};

	return (
		<header className="border-b border-border/40">
			<div className="max-w-4xl mx-auto px-6 py-6">
				<nav className="flex items-center justify-between">
					<Link
						ref={logoRef}
						href="/"
						onClick={handleLogoClick}
						className="text-xl font-semibold hover:text-primary transition-all duration-500 flex items-center"
					>
						{isJanuary2026 ? <Logo2026 /> : "omkar"}
					</Link>
					<div className="flex items-center gap-4">
						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="hover:text-foreground transition-colors"
								>
									{link.label}
								</Link>
							))}
						</div>

						{/* Mobile Navigation */}
						<div className="md:hidden">
							<DropdownMenu
								open={mobileMenuOpen}
								onOpenChange={setMobileMenuOpen}
							>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										{mobileMenuOpen ? (
											<X className="h-5 w-5" />
										) : (
											<Menu className="h-5 w-5" />
										)}
										<span className="sr-only">Toggle menu</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-40">
									{navLinks.map((link) => (
										<DropdownMenuItem key={link.href} asChild>
											<Link
												href={link.href}
												onClick={() => setMobileMenuOpen(false)}
												className="w-full"
											>
												{link.label}
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<ModeToggle />
					</div>
				</nav>
			</div>
		</header>
	);
}
