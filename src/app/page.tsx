import Link from "next/link";

const snippets = [
	{
		path: "/snippets/motion/button",
		name: "Button",
	},
	{
		path: "/snippets/motion/clerk-card",
		name: "Clerk Card",
	},
	{
		path: "/snippets/motion/variants",
		name: "Motion Variants Demo",
	},
];

export default function Home() {
	return (
		<div className="font-sans min-h-screen p-20">
			<div className="flex gap-4">
				{snippets.map((item) => (
					<Link
						key={item.path}
						href={item.path}
						className="p-1 rounded-2xl border px-4"
					>
						{item.name}
					</Link>
				))}
			</div>
		</div>
	);
}
