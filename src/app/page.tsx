import Link from "next/link";

const snippets = [
	{
		path: "/snippets/motion/button",
		name: "Button",
	},
];

export default function Home() {
	return (
		<div className="font-sans min-h-screen p-20">
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
	);
}
