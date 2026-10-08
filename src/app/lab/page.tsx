import { redirect } from "next/navigation";

/**
 * Version A won. B and C are parked in `scratch/lab-variants`, so the lab's
 * front door now goes straight to it.
 */
export default function Lab() {
	redirect("/lab/a");
}
