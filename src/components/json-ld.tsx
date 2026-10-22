/** A JSON-LD block. Takes a string already escaped by `graph()` or `jsonLdScript()`. */
export function JsonLd({ json }: { json: string }) {
	return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: json }} />;
}
