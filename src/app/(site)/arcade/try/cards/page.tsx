import { Cards } from "@/components/arcade/layouts/Cards";

import { VariantHead, tryMetadata } from "../variants";

export const metadata = tryMetadata("cards");

export default function Page() {
	return (
		<>
			<VariantHead current="/arcade/try/cards" />
			<Cards />
		</>
	);
}
