"use client";

import { useState } from "react";

export function FormValidationDemo() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<{ email?: string; password?: string }>(
		{}
	);

	const validateEmail = (value: string) => {
		if (!value) return "Email is required";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			return "Please enter a valid email";
		}
		return "";
	};

	const validatePassword = (value: string) => {
		if (!value) return "Password is required";
		if (value.length < 8) return "Password must be at least 8 characters";
		return "";
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const emailError = validateEmail(email);
		const passwordError = validatePassword(password);

		if (emailError || passwordError) {
			setErrors({
				email: emailError,
				password: passwordError,
			});
			return;
		}

		setErrors({});
		alert("Form submitted successfully!");
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Email
				</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						if (errors.email) {
							setErrors({ ...errors, email: validateEmail(e.target.value) });
						}
					}}
					onBlur={(e) => {
						setErrors({ ...errors, email: validateEmail(e.target.value) });
					}}
					className={`w-full px-3 py-2 rounded-md border ${
						errors.email
							? "border-destructive focus:border-destructive"
							: "border-border focus:border-primary"
					} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
					placeholder="you@example.com"
				/>
				{errors.email && (
					<p className="mt-1 text-sm text-destructive">{errors.email}</p>
				)}
			</div>

			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-foreground mb-1"
				>
					Password
				</label>
				<input
					id="password"
					type="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
						if (errors.password) {
							setErrors({
								...errors,
								password: validatePassword(e.target.value),
							});
						}
					}}
					onBlur={(e) => {
						setErrors({
							...errors,
							password: validatePassword(e.target.value),
						});
					}}
					className={`w-full px-3 py-2 rounded-md border ${
						errors.password
							? "border-destructive focus:border-destructive"
							: "border-border focus:border-primary"
					} bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring`}
					placeholder="••••••••"
				/>
				{errors.password && (
					<p className="mt-1 text-sm text-destructive">{errors.password}</p>
				)}
			</div>

			<button
				type="submit"
				className="w-full px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
			>
				Submit
			</button>
		</form>
	);
}
