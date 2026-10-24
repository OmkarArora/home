import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
	// The redesign was previewed under /lab/a. Send any old links to where each page lives now.
	async redirects() {
		return [
			{ source: "/lab", destination: "/", permanent: true },
			{ source: "/lab/a", destination: "/", permanent: true },
			{ source: "/lab/a/writing/:slug*", destination: "/blog/:slug*", permanent: true },
			{ source: "/lab/a/:path*", destination: "/:path*", permanent: true },
		];
	},
	// The résumé lives at /resume: the PDF is served there, so the address never
	// changes when the file does.
	async rewrites() {
		return [{ source: "/resume", destination: "/files/OmkarArora_Resume.pdf" }];
	},
	// It has a phone number on it, so keep it (and anything else in /files) out of search results.
	async headers() {
		const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];
		return [
			{ source: "/resume", headers: noindex },
			{ source: "/files/:path*", headers: noindex },
		];
	},
};

export default nextConfig;
