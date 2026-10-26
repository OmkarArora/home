import { audioContext } from "@/components/site/sound";

/**
 * What the record plays: a little lo-fi chiptune, made on the spot with the
 * Web Audio API like the site's other sounds (no file to download). Four
 * chords round and round (Am F C G) at 84 bpm: a soft triangle bass, a quiet
 * square-wave arpeggio, a hi-hat ticking on the off-beats and a slow melody
 * over the top, all through a warm low-pass and a little vinyl crackle.
 *
 * `startRecord()` begins it and returns a stop that fades it out.
 */

const bpm = 84;
const beat = 60 / bpm;
const eighth = beat / 2;

/** MIDI note number to frequency. */
const hz = (n: number) => 440 * 2 ** ((n - 69) / 12);

/** A bar per chord: root (for the bass) and the three chord tones (for the arpeggio). */
const chords = [
	{ root: 45, tones: [57, 60, 64] }, // Am
	{ root: 41, tones: [57, 60, 65] }, // F
	{ root: 48, tones: [55, 60, 64] }, // C
	{ root: 43, tones: [55, 59, 62] }, // G
];

/** The melody over eight bars, a note per beat (null rests), from A minor pentatonic. */
const melody = [
	[76, null, 72, 74], [72, null, 69, null], [72, 74, 76, null], [74, null, 71, null],
	[76, null, 79, 76], [74, null, 72, 69], [72, null, 74, 72], [71, null, null, null],
];

function note(ctx: AudioContext, out: AudioNode, type: OscillatorType, f: number, at: number, length: number, peak: number) {
	const osc = ctx.createOscillator();
	osc.type = type;
	osc.frequency.value = f;
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, at);
	gain.gain.exponentialRampToValueAtTime(peak, at + 0.01);
	gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
	osc.connect(gain).connect(out);
	osc.start(at);
	osc.stop(at + length + 0.05);
}

let noise: AudioBuffer | null = null;
function noiseBuffer(ctx: AudioContext) {
	if (noise) return noise;
	noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
	const data = noise.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	return noise;
}

function burst(ctx: AudioContext, out: AudioNode, at: number, length: number, peak: number) {
	const src = ctx.createBufferSource();
	src.buffer = noiseBuffer(ctx);
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(peak, at);
	gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
	src.connect(gain).connect(out);
	src.start(at);
	src.stop(at + length + 0.02);
}

export function startRecord() {
	const ctx = audioContext();
	const master = ctx.createGain();
	master.gain.setValueAtTime(0.0001, ctx.currentTime);
	master.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.6);
	// Warm it up: roll off the fizz, as if through an old amp.
	const warm = ctx.createBiquadFilter();
	warm.type = "lowpass";
	warm.frequency.value = 2600;
	warm.connect(master).connect(ctx.destination);
	const hats = ctx.createBiquadFilter();
	hats.type = "highpass";
	hats.frequency.value = 7000;
	hats.connect(master);

	// Schedule a little ahead, every 25 ms: steady timing whatever the main thread is doing.
	let step = 0;
	let next = ctx.currentTime + 0.1;
	const tick = () => {
		while (next < ctx.currentTime + 0.15) {
			const bar = Math.floor(step / 8);
			const inBar = step % 8;
			const chord = chords[bar % chords.length];
			if (inBar === 0 || inBar === 4) note(ctx, warm, "triangle", hz(chord.root), next, beat * 1.6, 0.16);
			note(ctx, warm, "square", hz(chord.tones[inBar % 3] + (inBar >= 4 ? 12 : 0)), next, eighth * 0.8, 0.018);
			if (inBar % 2 === 1) burst(ctx, hats, next, 0.04, 0.05);
			if (inBar % 2 === 0) {
				const tune = melody[bar % melody.length][inBar / 2];
				if (tune) note(ctx, warm, "triangle", hz(tune), next, beat * 0.9, 0.07);
			}
			// The crackle: now and then a tiny click.
			if (Math.random() < 0.35) burst(ctx, master, next + Math.random() * eighth, 0.004, 0.02 + Math.random() * 0.03);
			next += eighth;
			step++;
		}
	};
	tick();
	const timer = window.setInterval(tick, 25);

	return () => {
		window.clearInterval(timer);
		const now = ctx.currentTime;
		master.gain.cancelScheduledValues(now);
		master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
		master.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
		window.setTimeout(() => master.disconnect(), 700);
	};
}
