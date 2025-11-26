import type { NextConfig } from "next";
const withMDX = require("@next/mdx")();

const nextConfig: NextConfig = {
	pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
