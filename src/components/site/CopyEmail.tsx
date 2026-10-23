"use client";

import { useState } from "react";

import { mono } from "./ui";

/** The address in small type, and a button that copies it: for people who'd rather not open a mail app. */
export function CopyEmail({ email }: { email: string }) {
	const [copied, setCopied] = useState(false);

	return (
		<span className={`${mono} inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wider text-[var(--dim)]`}>
			<span className="normal-case tracking-normal">{email}</span>
			<button
				type="button"
				onClick={async () => {
					try {
						await navigator.clipboard.writeText(email);
						setCopied(true);
						setTimeout(() => setCopied(false), 2000);
					} catch {
						// Clipboard blocked: the address is right there to select.
					}
				}}
				className="border border-[var(--line)] px-2 py-1 font-bold text-[var(--ink)] hover:border-[var(--ink)]"
			>
				<span aria-live="polite">{copied ? "Copied ✓" : "Copy"}</span>
			</button>
		</span>
	);
}
