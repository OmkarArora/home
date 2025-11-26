import { type ComponentPropsWithoutRef } from "react";

export default function Heading(props: ComponentPropsWithoutRef<"h1">) {
	return <h1 className="text-2xl font-bold" {...props} />;
}
