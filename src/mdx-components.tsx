import type { MDXComponents } from "mdx/types";
import Heading from "./components/mdx/heading";

export function useMDXComponents(components: MDXComponents): MDXComponents {
	return {
		...components,
		h1: Heading,
	};
}
