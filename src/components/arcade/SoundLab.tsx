"use client";

import { useState } from "react";

import { label, mono } from "@/components/site/ui";
import { type Sfx, type VoiceName, playNotes, siteVoice, sounds, stepNote, voices } from "@/components/site/sound";

const names = Object.keys(sounds) as Sfx[];
const voiceNames = Object.keys(voices) as VoiceName[];

/**
 * Every sound in every voice, plus a strip to sweep for the hover run. Plays
 * even with sound switched off. Built to choose the site's voice; kept for the
 * Arcade (and a post on making the sounds).
 */
export function SoundLab() {
	const [voice, setVoice] = useState<VoiceName>(siteVoice);

	return (
		<div className="space-y-12">
			<div className="overflow-x-auto">
				<table className={`${mono} w-full min-w-[40rem] border-collapse text-xs uppercase tracking-wider`}>
					<thead>
						<tr>
							<th className="p-2 text-left text-[var(--dim)]">Sound</th>
							{voiceNames.map((name) => (
								<th key={name} className="p-2">
									<button
										type="button"
										data-sfx="none"
										onClick={() => setVoice(name)}
										className={`w-full px-2 py-1.5 font-bold ${voice === name ? "bg-[var(--lime)] text-[#0c0c0d]" : "border border-[var(--line)] hover:border-[var(--ink)]"}`}
									>
										{voices[name].label}
									</button>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{names.map((sound) => (
							<tr key={sound} className="border-t border-[var(--line)]">
								<td className="p-2 text-[var(--dim)]">{sound}</td>
								{voiceNames.map((name) => (
									<td key={name} className="p-2 text-center">
										<button
											type="button"
											data-sfx="none"
											onClick={() => playNotes(name, sounds[sound])}
											aria-label={`Play ${sound} in ${voices[name].label}`}
											className="size-9 border border-[var(--line)] hover:border-[var(--ink)] hover:bg-[var(--soft)] active:bg-[var(--lime)]"
										>
											▶
										</button>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
				<ul className="mt-6 space-y-2">
					{voiceNames.map((name) => (
						<li key={name} className="text-sm">
							<b>{voices[name].label}.</b> <span className="text-[var(--dim)]">{voices[name].note}</span>
						</li>
					))}
				</ul>
			</div>

			<div>
				<p className={label}>Hover run · in {voices[voice].label} (pick a voice above)</p>
				<p className="mt-2 text-[var(--dim)]">
					Sweep the pointer across the strip: each tile plays the next note up. Stop for half a second and it starts again
					from the bottom. This is what the About page's interests will do.
				</p>
				<div className="mt-4 grid grid-cols-8 gap-1">
					{Array.from({ length: 8 }, (_, i) => (
						<div
							key={i}
							onPointerEnter={() => stepNote(undefined, voice, true)}
							className="flex h-24 items-end border border-[var(--line)] p-2 text-xs text-[var(--dim)] hover:bg-[var(--lime)] hover:text-[#0c0c0d]"
						>
							{i + 1}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
