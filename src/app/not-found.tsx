import { NotFound as Content } from "@/components/site/NotFound";
import { SiteFrame } from "@/components/site/SiteFrame";

/** Any URL that matches no page: outside the site's layout, so it brings the frame itself. */
export default function NotFound() {
	return (
		<SiteFrame>
			<Content />
		</SiteFrame>
	);
}
