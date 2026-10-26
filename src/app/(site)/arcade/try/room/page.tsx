import { Arcade } from "@/components/arcade/Arcade";

import { tryMetadata } from "../variants";

export const metadata = tryMetadata("in a room");

/** Temporary: the 3D Arcade full screen, in the room with a window, to compare with the open sky. */
export default function Page() {
	return <Arcade full setting="room" />;
}
