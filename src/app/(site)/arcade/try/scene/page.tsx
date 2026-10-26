import { Arcade } from "@/components/arcade/Arcade";

import { VariantHead, tryMetadata } from "../variants";

export const metadata = tryMetadata("scene");

export default function Page() {
	return (
		<>
			<VariantHead current="/arcade/try/scene" />
			<Arcade />
		</>
	);
}
