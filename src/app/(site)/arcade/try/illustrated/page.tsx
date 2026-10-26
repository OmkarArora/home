import { Retro } from "@/components/arcade/layouts/Retro";

import { VariantHead, tryMetadata } from "../variants";

export const metadata = tryMetadata("illustrated");

export default function Page() {
	return (
		<>
			<VariantHead current="/arcade/try/illustrated" />
			<Retro style="illustrated" />
		</>
	);
}
