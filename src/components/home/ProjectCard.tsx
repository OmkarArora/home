import { ArrowUpRight, Github } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { SkillPills } from "@/components/home/skill-pills";
import { ProjectGallery, ProjectSlug } from "./ProjectGallery";

type ProjectCardProps = {
	title: string;
	project: ProjectSlug;
	description: string;
	skills: string[];
	href?: string; // main link (live app or repo)
	githubUrl?: string; // optional github icon link in header
	status?: string; // e.g. "(Sunsetted)"
	anchorWrap?: boolean; // wrap entire card in anchor (true for cards that are fully clickable)
};

export function ProjectCard({
	title,
	project,
	description,
	skills,
	href,
	githubUrl,
	status,
	anchorWrap = false,
}: ProjectCardProps) {
	const ContentWrapper =
		anchorWrap && href
			? (props: React.ComponentProps<"a">) => (
					<a
						{...props}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className={`group block ${props.className ?? ""}`}
					/>
			  )
			: (props: React.ComponentProps<"div">) => (
					<div className={`group ${props.className ?? ""}`} {...props} />
			  );

	return (
		<div className="border border-border rounded-lg p-6 hover:border-border/60 transition-colors hover:shadow-md">
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
					) : null}
				</div>
			</div>

			<ProjectGallery project={project} />

			<ContentWrapper>
				<p className="text-muted-foreground mb-4">{description}</p>

				<SkillPills skills={skills} size="sm" />
			</ContentWrapper>
		</div>
	);
}
