"use client";

import { useState } from "react";

type Todo = {
	id: string;
	text: string;
	completed: boolean;
};

async function fakeAddTodoApi(text: string): Promise<Todo> {
	await new Promise((resolve) => setTimeout(resolve, 1000));
	if (Math.random() < 0.15) {
		throw new Error("Failed to add todo. Please try again.");
	}
	return { id: Math.random().toString(36), text, completed: false };
}

async function fakeToggleTodoApi(
	id: string,
	completed: boolean
): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 600));
	if (Math.random() < 0.15) {
		throw new Error("Failed to update todo. Please try again.");
	}
}

async function fakeDeleteTodoApi(id: string): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 500));
	if (Math.random() < 0.15) {
		throw new Error("Failed to delete todo. Please try again.");
	}
}

export function OptimisticTodoDemo() {
	const [todos, setTodos] = useState<Todo[]>([
		{ id: "1", text: "Learn optimistic updates", completed: false },
		{ id: "2", text: "Build a todo app", completed: true },
	]);
	const [input, setInput] = useState("");
	const [error, setError] = useState<string | null>(null);

	async function handleAdd() {
		const text = input.trim();
		if (!text || todos.some((t) => t.text === text)) return;

		setError(null);
		const tempId = `temp-${Date.now()}`;
		const newTodo: Todo = { id: tempId, text, completed: false };

		setTodos((prev) => [...prev, newTodo]);
		setInput("");

		try {
			const saved = await fakeAddTodoApi(text);
			setTodos((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
		} catch (err) {
			setTodos((prev) => prev.filter((t) => t.id !== tempId));
			setError((err as Error).message);
		}
	}

	async function handleToggle(id: string) {
		const todo = todos.find((t) => t.id === id);
		if (!todo) return;

		setError(null);
		const previous = todo.completed;
		const next = !todo.completed;

		setTodos((prev) =>
			prev.map((t) => (t.id === id ? { ...t, completed: next } : t))
		);

		try {
			await fakeToggleTodoApi(id, next);
		} catch (err) {
			setTodos((prev) =>
				prev.map((t) => (t.id === id ? { ...t, completed: previous } : t))
			);
			setError((err as Error).message);
		}
	}

	async function handleDelete(id: string) {
		setError(null);
		const deleted = todos.find((t) => t.id === id);
		if (!deleted) return;

		setTodos((prev) => prev.filter((t) => t.id !== id));

		try {
			await fakeDeleteTodoApi(id);
		} catch (err) {
			setTodos((prev) =>
				[...prev, deleted].sort((a, b) => a.id.localeCompare(b.id))
			);
			setError((err as Error).message);
		}
	}

	return (
		<div className="space-y-3 text-sm border rounded-lg p-4 bg-muted/30">
			<div className="flex gap-2">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAdd()}
					placeholder="Add a todo..."
					className="flex-1 rounded-md border bg-background px-2 py-1 text-xs md:text-sm"
				/>
				<button
					onClick={handleAdd}
					className="rounded-md bg-primary px-3 py-1 text-xs md:text-sm text-primary-foreground"
				>
					Add
				</button>
			</div>
			{error && <p className="text-xs text-red-500">{error}</p>}
			<ul className="space-y-2">
				{todos.map((todo) => (
					<li
						key={todo.id}
						className="flex items-center gap-2 text-xs md:text-sm"
					>
						<input
							type="checkbox"
							checked={todo.completed}
							onChange={() => handleToggle(todo.id)}
							className="rounded"
						/>
						<span
							className={`flex-1 ${
								todo.completed ? "line-through text-muted-foreground" : ""
							}`}
						>
							{todo.text}
						</span>
						<button
							onClick={() => handleDelete(todo.id)}
							className="text-red-500 hover:text-red-700 text-xs"
						>
							Delete
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
