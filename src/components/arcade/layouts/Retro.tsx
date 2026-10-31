"use client";

import { illustrated } from "../cabinet/Illustrated";
import { pixelArt } from "../cabinet/Pixel";
import { Shell } from "../cabinet/Shell";
import { Crt } from "../Crt";
import { MachineInfo } from "../MachineInfo";
import { useArcade } from "../useArcade";

/**
 * A drawn arcade cabinet (`style`) with the machine on its CRT. The stick and
 * buttons work: ◀ ▶ (or the arrow keys) change machines, START opens the
 * pause menu, and the coin slot takes a coin. How it works and the knobs sit
 * beside the cabinet on wide screens, under it on phones.
 */

const arts = { illustrated, pixel: pixelArt };

export function Retro({ style }: { style: keyof typeof arts }) {
	const art = arts[style];
	const { at, machine, pressed, tilt, move, start, coin, startRef, menu } = useArcade();
	const { Play } = machine;

	return (
		<div className="pb-16">
			<Play
				key={machine.key}
				layout={(screen, knobs) => (
					<div className="grid items-start gap-10 lg:grid-cols-[minmax(0,30rem)_1fr]">
						<div className="mx-auto w-full max-w-[30rem]">
							<Shell
								art={art}
								state={{ tilt, pressed, title: machine.name }}
								screen={
									<Crt channel={machine.key} className="size-full">
										{screen}
									</Crt>
								}
								startRef={startRef}
								on={{ prev: () => move(-1), next: () => move(1), start, coin }}
							/>
						</div>
						<div className="lg:sticky lg:top-8">
							<MachineInfo at={at} machine={machine} knobs={knobs} />
						</div>
					</div>
				)}
			/>
			{menu}
		</div>
	);
}
