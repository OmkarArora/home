import { Mail, Github, Linkedin, MapPin } from "lucide-react";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<>
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
		</>
	);
}
