import type { ReactNode } from "react";

/**
 * The box every demo in a post sits in: a labelled header, then the demo.
 * Written against the site-wide colour tokens only, so it follows whichever
 * palette the page around it sets.
 */
export function DemoFrame({
	tag = "Demo",
	title,
	description,
	className = "",
	children,
}: {
	/** What kind of thing this is: "Demo", "Compare", "Steps"… */
	tag?: string;
	title?: string;
	description?: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div className={`not-prose my-8 overflow-hidden rounded-lg border border-foreground ${className}`}>
			<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-foreground bg-muted px-4 py-2.5">
				<span className="bg-foreground px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-background">
					{tag}
				</span>
				{title && <h4 className="text-sm font-bold text-foreground">{title}</h4>}
				{description && <p className="basis-full text-sm text-muted-foreground">{description}</p>}
			</div>
			{children}
		</div>
	);
}

/** The small mono caption above a pane inside a demo ("Code", "Preview", "Output"). */
export const paneLabel = "font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground";

/** A tab in a demo. The active one is underlined in the page's highlight colour. */
export const tabClass = (active: boolean) =>
	`flex-1 border-b-2 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
		active
			? "border-[var(--lime,var(--primary))] bg-background text-foreground"
			: "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
	}`;
