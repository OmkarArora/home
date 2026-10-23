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
};

export default nextConfig;
