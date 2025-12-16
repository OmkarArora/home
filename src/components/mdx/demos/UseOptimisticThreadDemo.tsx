"use client";

import { useOptimistic, useState, useTransition } from "react";

function deliverMessage(message: string): Promise<string> {
	return new Promise((resolve) => {
		setTimeout(() => resolve(message), 800);
	});
}

export function UseOptimisticThreadDemo() {
	const [messages, setMessages] = useState<
		{ text: string; sending?: boolean }[]
	>([{ text: "Hello there!", sending: false }]);
	const [isPending, startTransition] = useTransition();
	const [optimisticMessages, addOptimisticMessage] = useOptimistic(
		messages,
		(state, newMessage: string) => [
			{ text: newMessage, sending: true },
			...state,
		]
	);

	async function handleSend(formData: FormData) {
		const text = String(formData.get("message") || "").trim();
		if (!text) return;

		addOptimisticMessage(text);

		startTransition(async () => {
			const delivered = await deliverMessage(text);
			setMessages((current) => [
				{ text: delivered, sending: false },
				...current,
			]);
		});
	}

	return (
		<div className="space-y-3 text-sm border rounded-lg p-4 bg-muted/30">
			<form action={handleSend} className="flex items-center gap-2">
				<input
					name="message"
					placeholder="Say hi!"
					className="flex-1 rounded-md border bg-background px-2 py-1 text-xs md:text-sm"
				/>
				<button
					type="submit"
					disabled={isPending}
					className="rounded-md bg-primary px-3 py-1 text-xs md:text-sm text-primary-foreground disabled:opacity-60"
				>
					Send
				</button>
			</form>
			<div className="space-y-1 max-h-48 overflow-y-auto">
				{optimisticMessages.map((message, index) => (
					<div
						key={index}
						className="text-xs md:text-sm p-2 rounded bg-background/50"
					>
						{message.text}
						{message.sending && (
							<span className="ml-1 text-[10px] text-muted-foreground">
								(Sending…)
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
