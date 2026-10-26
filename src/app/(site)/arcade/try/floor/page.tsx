import { Floor } from "@/components/arcade/layouts/Floor";

import { VariantHead, tryMetadata } from "../variants";

export const metadata = tryMetadata("floor");

export default function Page() {
	return (
		<>
			<VariantHead current="/arcade/try/floor" />
			<Floor />
		</>
	);
}
