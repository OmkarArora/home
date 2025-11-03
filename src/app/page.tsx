import Link from "next/link";
import {
	ArrowUpRight,
	Mail,
	Github,
	Linkedin,
	MapPin,
	Calendar,
	Building,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { SkillPills } from "@/components/skill-pills";

export default function Home() {
	const currentYear = new Date().getFullYear();

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Header */}
			<header className="border-b border-border/40">
				<div className="max-w-4xl mx-auto px-6 py-6">
					<nav className="flex items-center justify-between">
						<div className="text-xl font-semibold">omkar</div>
						<div className="flex items-center gap-6">
							<div className="flex items-center gap-6 text-sm text-muted-foreground">
								<Link
									href="#work"
									className="hover:text-foreground transition-colors"
								>
									work
								</Link>
								<Link
									href="#projects"
									className="hover:text-foreground transition-colors"
								>
									projects
								</Link>
								{/* <Link
									href="#writing"
									className="hover:text-foreground transition-colors"
								>
									writing
								</Link> */}
								<Link
									href="#contact"
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

			{/* Hero Section */}
			<section className="max-w-4xl mx-auto px-6 py-20">
				<div className="space-y-6">
					<h1 className="text-5xl font-bold tracking-tight">Omkar Arora</h1>
					<p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
						Senior Frontend Engineer crafting exceptional web experiences.
						Specializing in React.js, Next.js, and TypeScript to build scalable,
						high-performance applications.
					</p>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<MapPin className="w-4 h-4" />
							<span>Nagpur, Maharashtra, India</span>
						</div>
						<div className="flex items-center gap-2">
							<Building className="w-4 h-4" />
							<span>Sparklin Innovations</span>
						</div>
					</div>
				</div>
			</section>

			{/* Work Experience */}
			<section id="work" className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-2xl font-semibold mb-12">Work Experience</h2>
				<div className="space-y-12">
					<div className="border-l-2 border-border pl-6">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h3 className="text-xl font-semibold">
									Software Development Engineer 2
								</h3>
								<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
									<Building className="w-4 h-4" />
									<span>Sparklin Innovations Pvt Ltd, New Delhi</span>
									<Calendar className="w-4 h-4" />
									<span>April 2024 - Present</span>
								</div>
							</div>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>
								Leading frontend development for key products (Openvy,
								Recommendations.email, Jupitun) using React.js, Next.js, and
								TypeScript.
							</p>
							<p>
								Enhanced application performance through SEO optimization and
								advanced caching, reducing data fetching time by 30% and
								improving organic traffic by 20%.
							</p>
							<p>
								Built responsive and visually consistent UIs with Tailwind CSS,
								championing technical excellence through code reviews and
								mentoring.
							</p>
						</div>
					</div>

					<div className="border-l-2 border-border pl-6">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h3 className="text-xl font-semibold">
									Software Development Engineer
								</h3>
								<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
									<Building className="w-4 h-4" />
									<span>Sparklin Innovations Pvt Ltd, New Delhi</span>
									<Calendar className="w-4 h-4" />
									<span>November 2021 - April 2024</span>
								</div>
							</div>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>
								Designed and implemented front-end architecture for Openvy using
								Next.js and Tailwind CSS.
							</p>
							<p>
								Contributed to full-stack development projects, focusing on
								front-end optimization and feature scalability.
							</p>
							<p>
								Developed and tested React Native mobile prototypes, improving
								mobile user engagement by 15%.
							</p>
						</div>
					</div>

					<div className="border-l-2 border-border pl-6">
						<div className="flex items-start justify-between mb-4">
							<div>
								<h3 className="text-xl font-semibold">
									Frontend Developer Intern
								</h3>
								<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
									<Building className="w-4 h-4" />
									<span>
										Homerunn, Avana Property Solutions Pvt. Ltd., Noida
									</span>
									<Calendar className="w-4 h-4" />
									<span>June 2020 - September 2020</span>
								</div>
							</div>
						</div>
						<div className="space-y-3 text-muted-foreground">
							<p>
								Resolved critical UI bugs and optimized rendering, improving
								page load speed by 20%.
							</p>
							<p>
								Ensured seamless experience across 3+ major browsers through
								cross-browser compatibility testing.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Work Projects */}
			<section id="projects" className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-2xl font-semibold mb-12">Work</h2>
				<div className="space-y-6">
					<div className="group border border-border rounded-lg p-6 hover:border-border/60 transition-colors">
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-xl font-semibold">Jupitun</h3>
						</div>
						<p className="text-muted-foreground mb-4">
							Developed scalable frontend architecture with focus on performance
							optimization and user experience with a Local-First approach and
							Optimistic Updates.
						</p>
						<SkillPills
							skills={["Next.js", "React.js", "Tailwind CSS", "Scalability"]}
							size="sm"
						/>
					</div>

					<a
						href="https://openvy.com/"
						target="_blank"
						rel="noopener noreferrer"
						className="group border border-border rounded-lg p-6 hover:border-border/60 transition-colors block hover:shadow-md"
					>
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-xl font-semibold">
								Openvy{" "}
								<span className="text-sm font-normal text-muted-foreground">
									(Sunsetted)
								</span>
							</h3>
							<ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
						</div>
						<p className="text-muted-foreground mb-4">
							Lead frontend development for the product Openvy using Next.js and
							Tailwind CSS. Implemented advanced caching strategies and SEO
							optimization.
						</p>
						<SkillPills
							skills={[
								"Next.js",
								"React.js",
								"TypeScript",
								"Tailwind CSS",
								"Caching",
								"Motion (Framer Motion)",
								"SEO",
							]}
							size="sm"
						/>
					</a>

					<a
						href="https://recommendations.email/"
						target="_blank"
						rel="noopener noreferrer"
						className="group border border-border rounded-lg p-6 hover:border-border/60 transition-colors block hover:shadow-md"
					>
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-xl font-semibold">
								Recommendations.email{" "}
								<span className="text-sm font-normal text-muted-foreground">
									(Sunsetted)
								</span>
							</h3>
							<ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
						</div>
						<p className="text-muted-foreground mb-4">
							Built responsive and performant email templates using React Email,
							and a word guessing game. The app allows user to use their Openvy
							login to keep track of scores!
						</p>
						<SkillPills
							skills={[
								"Next.js",
								"React.js",
								"Tailwind CSS",
								"React Email",
								"TypeScript",
								"State Management",
							]}
							size="sm"
						/>
					</a>
				</div>
			</section>

			{/* Personal Projects */}
			<section className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-2xl font-semibold mb-12">Personal Projects</h2>
				<div className="space-y-6">
					<a
						href="https://github.com/OmkarArora/team-resume-builder"
						target="_blank"
						rel="noopener noreferrer"
						className="group border border-border rounded-lg p-6 hover:border-border/60 transition-colors block hover:shadow-md"
					>
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-xl font-semibold">Team Resume Builder</h3>
							<ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
						</div>
						<p className="text-muted-foreground mb-4">
							A modern React app to create, edit, and export professional
							resumes with PDF preview/download, team management, and a
							centralized, type-safe routing system.
						</p>
						<SkillPills
							skills={[
								"React (Vite)",
								"TypeScript",
								"React Router",
								"Tailwind CSS",
								"shadcn/ui",
								"Zustand",
								"@react-pdf/renderer",
							]}
							size="sm"
						/>
					</a>

					<a
						href="https://github.com/OmkarArora/highlight-extension"
						target="_blank"
						rel="noopener noreferrer"
						className="group border border-border rounded-lg p-6 hover:border-border/60 transition-colors block hover:shadow-md"
					>
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-xl font-semibold">
								Website Highlight Saver (Chrome Extension)
							</h3>
							<ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
						</div>
						<p className="text-muted-foreground mb-4">
							Highlight text on any page and save locally with a beautiful popup
							UI, website exclusions, full-page view, and optional AI summaries.
						</p>
						<SkillPills
							skills={[
								"TypeScript",
								"React",
								"Manifest V3",
								"Webpack",
								"Chrome Storage API",
								"CSS",
							]}
							size="sm"
						/>
					</a>
				</div>
			</section>

			{/* Technical Skills */}
			<section className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-2xl font-semibold mb-12">Technical Skills</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Frontend Development</h3>
						<SkillPills
							skills={[
								"React.js",
								"Next.js",
								"React Native",
								"TypeScript",
								"JavaScript (ES6+)",
								"Tailwind CSS",
								"HTML5",
								"CSS3",
								"Shadcn UI",
								"Radix UI",
								"Motion (Framer Motion)",
							]}
						/>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">State Management & Tools</h3>
						<SkillPills
							skills={[
								"Context API",
								"Zustand",
								"Redux Toolkit",
								"React Query",
								"Jest",
								"React Testing Library",
								"Git",
								"Webpack",
							]}
						/>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">Performance & Optimization</h3>
						<SkillPills
							skills={[
								"SEO Optimization",
								"Browser Caching",
								"CDN",
								"Optimistic Updates",
								"Performance Monitoring",
								"CI/CD Pipelines",
							]}
						/>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium">Backend & Other</h3>
						<SkillPills
							skills={[
								"Node.js",
								"REST APIs",
								"Convex DB",
								"SQL",
								"NoSQL",
								"Java",
								"Agile Development",
								"Technical Mentoring",
							]}
						/>
					</div>
				</div>
			</section>

			{/* Education */}
			<section className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-2xl font-semibold mb-12">Education</h2>
				<div className="border-l-2 border-border pl-6">
					<h3 className="text-xl font-semibold">
						Bachelor of Engineering (B.E.) in Computer Science and Engineering
					</h3>
					<div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
						<Building className="w-4 h-4" />
						<span>
							Shri Ramdeobaba College of Engineering and Management, Nagpur
						</span>
						<Calendar className="w-4 h-4" />
						<span>2017-2021</span>
					</div>
					<p className="text-muted-foreground mt-2">CGPA: 9.37</p>
				</div>
			</section>

			{/* Contact */}
			<section id="contact" className="max-w-4xl mx-auto px-6 py-16">
				<h2 className="text-2xl font-semibold mb-12">Get in Touch</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Let's work together</h3>
						<p className="text-muted-foreground">
							I'm always interested in new opportunities and exciting projects.
							Feel free to reach out if you'd like to collaborate or just want
							to say hello.
						</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<Mail className="w-5 h-5 text-muted-foreground" />
							<a
								href="mailto:aroraomkar12@gmail.com"
								className="text-foreground hover:text-primary transition-colors"
							>
								aroraomkar12@gmail.com
							</a>
						</div>

						<div className="flex items-center gap-3">
							<Linkedin className="w-5 h-5 text-muted-foreground" />
							<a
								href="https://www.linkedin.com/in/omkar-arora-0ab08375"
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground hover:text-primary transition-colors"
							>
								LinkedIn Profile
							</a>
						</div>

						<div className="flex items-center gap-3">
							<Github className="w-5 h-5 text-muted-foreground" />
							<a
								href="https://github.com/OmkarArora"
								target="_blank"
								rel="noopener noreferrer"
								className="text-foreground hover:text-primary transition-colors"
							>
								GitHub
							</a>
						</div>

						<div className="flex items-center gap-3">
							<MapPin className="w-5 h-5 text-muted-foreground" />
							<span className="text-muted-foreground">
								Nagpur, Maharashtra, India
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border/40 py-8">
				<div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
					<p>
						© {currentYear} Omkar Arora. Built with Next.js and Tailwind CSS.
					</p>
				</div>
			</footer>
		</div>
	);
}
