import { NotFound as Content } from "@/components/site/NotFound";

/** A page that calls `notFound()`, such as a missing post: the site's layout is already around it. */
export default function NotFound() {
	return <Content />;
}
