export default function SnippetsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<main className="flex justify-center items-center min-h-screen w-screen bg-white">
			{children}
		</main>
	);
}
