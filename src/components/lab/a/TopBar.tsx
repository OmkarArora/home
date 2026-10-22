"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LocalTime } from "@/components/lab/LocalTime";
import { identity } from "@/content/profile";

import { SlideSwitch } from "./ThemeSwitch";
import { base, mono, nav } from "./ui";

export function TopBar() {
	const pathname = usePathname();

	return (
		<header
			className={`${mono} flex flex-wrap items-center justify-between gap-x-4 border-b border-[var(--line)] py-4 text-xs`}
		>
			<Link href={base} className="flex items-center gap-2 font-bold uppercase tracking-wider">
				<span className="size-2 bg-[var(--lime)]" />
				{identity.name}
			</Link>
			{/* On a phone the links get a row of their own, under the name. */}
			<nav className="order-last flex w-full justify-between gap-4 pt-3 md:justify-start md:gap-6 uppercase tracking-wider text-[var(--dim)] md:order-none md:w-auto md:pt-0">
				{nav.map((item) => {
					const active = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? "page" : undefined}
							className={
								active
									? "text-[var(--ink)] underline decoration-[var(--lime)] decoration-2 underline-offset-[6px]"
									: "hover:text-[var(--ink)]"
							}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>
			<div className="flex items-center gap-3">
				<LocalTime className="hidden text-[var(--dim)] sm:inline" />
				<SlideSwitch />
			</div>
		</header>
	);
}
