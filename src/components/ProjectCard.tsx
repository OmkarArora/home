import { ArrowUpRight, Github } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { SkillPills } from "@/components/skill-pills";

type ProjectCardProps = {
	title: string;
	description: string;
	skills: string[];
	href?: string; // main link (live app or repo)
	githubUrl?: string; // optional github icon link in header
	status?: string; // e.g. "(Sunsetted)"
	anchorWrap?: boolean; // wrap entire card in anchor (true for cards that are fully clickable)
};

export function ProjectCard({
	title,
	description,
	skills,
	href,
	githubUrl,
	status,
	anchorWrap = false,
}: ProjectCardProps) {
	const CardWrapper = (
		anchorWrap && href
			? (props: React.ComponentProps<"a">) => (
					<a
						{...props}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className={`group border border-border rounded-lg p-6 hover:border-border/60 transition-colors block hover:shadow-md ${
							props.className ?? ""
						}`}
					/>
			  )
			: (props: React.ComponentProps<"div">) => (
					<div
						{...props}
						className={`group border border-border rounded-lg p-6 hover:border-border/60 transition-colors hover:shadow-md ${
							props.className ?? ""
						}`}
					/>
			  )
	) as any;

	return (
		<CardWrapper>
			<div className="flex items-start justify-between mb-4">
				<h3 className="text-xl font-semibold">
					{title}{" "}
					{status ? (
						<span className="text-sm font-normal text-muted-foreground">
							{status}
						</span>
					) : null}
				</h3>

				<div className="flex items-center gap-2">
					{githubUrl ? (
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="hover:bg-transparent group"
						>
							<a
								href={githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="GitHub repository"
								title="GitHub"
							>
								<Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
							</a>
						</Button>
					) : null}

					{href ? (
						anchorWrap ? (
							<span
								className={
									buttonVariants({ variant: "ghost", size: "sm" }) +
									" hover:bg-transparent"
								}
								aria-hidden
							>
								<ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
							</span>
						) : (
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="hover:bg-transparent"
							>
								<a
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Open link"
									title="Open link"
								>
									<ArrowUpRight className="w-4 h-4" />
								</a>
							</Button>
						)
					) : null}
				</div>
			</div>

			<p className="text-muted-foreground mb-4">{description}</p>

			<SkillPills skills={skills} size="sm" />
		</CardWrapper>
	);
}
