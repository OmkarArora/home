import { Retro } from "@/components/arcade/layouts/Retro";

import { VariantHead, tryMetadata } from "../variants";

export const metadata = tryMetadata("pixel");

export default function Page() {
	return (
		<>
			<VariantHead current="/arcade/try/pixel" />
			<Retro style="pixel" />
		</>
	);
}
