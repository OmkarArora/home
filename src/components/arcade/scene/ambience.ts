import { audioContext, isSoundOn } from "@/components/site/sound";

/**
 * The Arcade's sound bed, made on the spot with Web Audio like the site's
 * other sounds (no files), after Jesse Zhou's ramen stall, which hums and
 * sizzles the whole time you're there. Here: the cabinet's mains hum and fan,
 * a low room tone, crickets out in the night, and the TV's game blipping.
 * Quiet, under the record. All of it goes silent with the tab (the shared
 * audio context suspends) and only plays with sound on.
 */

function noise(ctx: AudioContext, seconds: number, brown = false) {
	const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
	const data = buffer.getChannelData(0);
	let last = 0;
	for (let i = 0; i < data.length; i++) {
		const white = Math.random() * 2 - 1;
		// Brown noise: each sample a small step from the last, which keeps the low end and drops the hiss.
		last = brown ? (last + 0.02 * white) / 1.02 : white;
		data[i] = brown ? last * 3.5 : white;
	}
	return buffer;
}

function loop(ctx: AudioContext, buffer: AudioBuffer, out: AudioNode) {
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.loop = true;
	src.connect(out);
	src.start();
	return src;
}

/** Starts the bed, fading in; returns a stop that fades it out. */
export function startAmbience() {
	const ctx = audioContext();
	const master = ctx.createGain();
	master.gain.setValueAtTime(0.0001, ctx.currentTime);
	master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2);
	master.connect(ctx.destination);
	const stops: (() => void)[] = [];

	// Room tone: low brown noise.
	const room = ctx.createBiquadFilter();
	room.type = "lowpass";
	room.frequency.value = 380;
	const roomGain = ctx.createGain();
	roomGain.gain.value = 0.05;
	room.connect(roomGain).connect(master);
	const roomSrc = loop(ctx, noise(ctx, 6, true), room);
	stops.push(() => roomSrc.stop());

	// The cabinet: mains hum (50 Hz and its harmonics) and a fan's breathy whirr.
	for (const [f, g] of [
		[50, 0.012],
		[100, 0.007],
		[150, 0.003],
	]) {
		const osc = ctx.createOscillator();
		osc.frequency.value = f;
		const gain = ctx.createGain();
		gain.gain.value = g;
		osc.connect(gain).connect(master);
		osc.start();
		stops.push(() => osc.stop());
	}
	const fan = ctx.createBiquadFilter();
	fan.type = "bandpass";
	fan.frequency.value = 900;
	fan.Q.value = 0.8;
	const fanGain = ctx.createGain();
	fanGain.gain.value = 0.006;
	fan.connect(fanGain).connect(master);
	const fanSrc = loop(ctx, noise(ctx, 4), fan);
	stops.push(() => fanSrc.stop());

	// Crickets: now and then a little train of chirps, each a quick pulse of a high tone.
	let timer = 0;
	const chirp = () => {
		const at = ctx.currentTime + 0.05;
		const pitch = 4200 + Math.random() * 600;
		const count = 3 + Math.floor(Math.random() * 4);
		const pan = ctx.createStereoPanner();
		pan.pan.value = Math.random() * 1.6 - 0.8;
		pan.connect(master);
		for (let i = 0; i < count; i++) {
			const t = at + i * 0.075;
			const osc = ctx.createOscillator();
			osc.frequency.value = pitch;
			const gain = ctx.createGain();
			gain.gain.setValueAtTime(0.0001, t);
			gain.gain.exponentialRampToValueAtTime(0.006, t + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
			osc.connect(gain).connect(pan);
			osc.start(t);
			osc.stop(t + 0.06);
		}
		timer = window.setTimeout(chirp, 1500 + Math.random() * 4500);
	};
	timer = window.setTimeout(chirp, 1200);
	stops.push(() => window.clearTimeout(timer));

	return () => {
		const now = ctx.currentTime;
		master.gain.cancelScheduledValues(now);
		master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
		master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
		window.setTimeout(() => {
			for (const stop of stops) stop();
			master.disconnect();
		}, 700);
	};
}

/** The TV's game: a soft blip when the ball meets a paddle (higher off the right one). */
export function tvBlip(right: boolean) {
	if (!isSoundOn()) return;
	const ctx = audioContext();
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	osc.type = "square";
	osc.frequency.value = right ? 660 : 495;
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, t);
	gain.gain.exponentialRampToValueAtTime(0.006, t + 0.005);
	gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
	osc.connect(gain).connect(ctx.destination);
	osc.start(t);
	osc.stop(t + 0.08);
}

/** A whoosh for the camera flying to a new view: a band of noise sweeping up and back, as long as the flight. */
export function whoosh(seconds: number) {
	if (!isSoundOn()) return;
	const ctx = audioContext();
	const t = ctx.currentTime;
	const length = Math.min(1.6, seconds * 0.85);
	const src = ctx.createBufferSource();
	src.buffer = noise(ctx, length + 0.1);
	const band = ctx.createBiquadFilter();
	band.type = "bandpass";
	band.Q.value = 1.4;
	band.frequency.setValueAtTime(260, t);
	band.frequency.exponentialRampToValueAtTime(1500, t + length * 0.45);
	band.frequency.exponentialRampToValueAtTime(320, t + length);
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, t);
	gain.gain.exponentialRampToValueAtTime(0.16, t + length * 0.42);
	gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
	src.connect(band).connect(gain).connect(ctx.destination);
	src.start(t);
	src.stop(t + length + 0.05);
}
