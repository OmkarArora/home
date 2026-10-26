import { Arcade } from "@/components/arcade/Arcade";

import { tryMetadata } from "../variants";

export const metadata = tryMetadata("full screen");

/** Temporary: the 3D Arcade filling the window, to judge it full screen. */
export default function Page() {
	return <Arcade full />;
}
