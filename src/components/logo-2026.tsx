"use client";

export function Logo2026() {
	return (
		<svg
			width="140"
			height="40"
			viewBox="0 0 140 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="inline-block"
		>
			<defs>
				{/* Crayon texture filter for rough appearance */}
				<filter id="crayonRough" x="-20%" y="-20%" width="140%" height="140%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.04"
						numOctaves="3"
						result="noise"
					/>
					<feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
				</filter>

				{/* Crayon colors - vibrant and bold */}
				<linearGradient id="crayon1" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FFD700" />
					<stop offset="100%" stopColor="#FF6B6B" />
				</linearGradient>
				<linearGradient id="crayon2" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#4ECDC4" />
					<stop offset="100%" stopColor="#FFE66D" />
				</linearGradient>
				<linearGradient id="crayon3" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FF6B9D" />
					<stop offset="100%" stopColor="#C44569" />
				</linearGradient>
				<linearGradient id="crayon4" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FFD700" />
					<stop offset="100%" stopColor="#4ECDC4" />
				</linearGradient>
			</defs>

			{/* 2 - First digit (hand-drawn, wobbly) */}
			<path
				d="M8 8 Q8 4, 12 4 Q16 4, 16 8 Q16 10, 14 10 Q12 10, 12 12 Q12 14, 14 14 Q12 18, 12 20 Q12 22, 14 22 Q18 22, 18 24 Q18 26, 16 26 Q8 26, 8 24 Q8 20, 8 8 Z"
				fill="url(#crayon1)"
				filter="url(#crayonRough)"
			/>
			<path
				d="M8 8 Q8 4, 12 4 Q16 4, 16 8 Q16 10, 14 10 Q12 10, 12 12 Q12 14, 14 14 Q12 18, 12 20 Q12 22, 14 22 Q18 22, 18 24 Q18 26, 16 26 Q8 26, 8 24 Q8 20, 8 8"
				fill="none"
				stroke="url(#crayon1)"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* 0 - Second digit (hand-drawn oval) */}
			<path
				d="M32 8 Q28 6, 28 16 Q28 26, 32 28 Q36 28, 40 26 Q40 16, 40 6 Q36 4, 32 8"
				fill="url(#crayon2)"
				filter="url(#crayonRough)"
			/>
			<path
				d="M32 8 Q28 6, 28 16 Q28 26, 32 28 Q36 28, 40 26 Q40 16, 40 6 Q36 4, 32 8"
				fill="none"
				stroke="url(#crayon2)"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M34 12 Q32 10, 30 16 Q30 22, 34 24 Q36 24, 38 22 Q38 16, 38 10 Q36 8, 34 12"
				fill="currentColor"
				className="fill-background"
			/>

			{/* 2 - Third digit (hand-drawn, wobbly) */}
			<path
				d="M52 8 Q52 4, 56 4 Q60 4, 60 8 Q60 10, 58 10 Q56 10, 56 12 Q56 14, 58 14 Q56 18, 56 20 Q56 22, 58 22 Q62 22, 62 24 Q62 26, 60 26 Q52 26, 52 24 Q52 20, 52 8 Z"
				fill="url(#crayon3)"
				filter="url(#crayonRough)"
			/>
			<path
				d="M52 8 Q52 4, 56 4 Q60 4, 60 8 Q60 10, 58 10 Q56 10, 56 12 Q56 14, 58 14 Q56 18, 56 20 Q56 22, 58 22 Q62 22, 62 24 Q62 26, 60 26 Q52 26, 52 24 Q52 20, 52 8"
				fill="none"
				stroke="url(#crayon3)"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* 6 - Fourth digit (hand-drawn) */}
			<path
				d="M72 8 Q72 4, 76 4 Q80 4, 80 8 Q80 12, 78 14 Q76 16, 76 18 Q76 20, 78 20 Q80 20, 80 22 Q80 24, 78 24 Q74 24, 74 22 Q74 20, 76 20 Q74 18, 74 16 Q74 12, 72 8"
				fill="url(#crayon4)"
				filter="url(#crayonRough)"
			/>
			<path
				d="M72 8 Q72 4, 76 4 Q80 4, 80 8 Q80 12, 78 14 Q76 16, 76 18 Q76 20, 78 20 Q80 20, 80 22 Q80 24, 78 24 Q74 24, 74 22 Q74 20, 76 20 Q74 18, 74 16 Q74 12, 72 8"
				fill="none"
				stroke="url(#crayon4)"
				strokeWidth="4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<ellipse
				cx="78"
				cy="18"
				rx="2.5"
				ry="4"
				fill="currentColor"
				className="fill-background"
			/>
		</svg>
	);
}
