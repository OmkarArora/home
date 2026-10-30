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

/** The bed playing now, so something can hush it for a while (`hushAmbience`). */
let bed: GainNode | null = null;
let hushed = false;

/** Starts the bed, fading in; returns a stop that fades it out. */
export function startAmbience() {
	const ctx = audioContext();
	const master = ctx.createGain();
	master.gain.setValueAtTime(0.0001, ctx.currentTime);
	if (!hushed) master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2);
	master.connect(ctx.destination);
	bed = master;
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
		if (bed === master) bed = null;
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

/** Fades the bed away (for the dragon), or back in. */
export function hushAmbience(quiet: boolean) {
	hushed = quiet;
	if (!bed) return;
	const now = bed.context.currentTime;
	bed.gain.cancelScheduledValues(now);
	bed.gain.setValueAtTime(Math.max(bed.gain.value, 0.0001), now);
	bed.gain.exponentialRampToValueAtTime(quiet ? 0.0001 : 1, now + (quiet ? 1.5 : 3));
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

/** A long low rumble building under the summon: brown noise swelling and falling over `seconds`. */
export function rumble(seconds: number) {
	if (!isSoundOn()) return;
	const ctx = audioContext();
	const t = ctx.currentTime;
	const src = ctx.createBufferSource();
	src.buffer = noise(ctx, seconds + 0.2, true);
	const low = ctx.createBiquadFilter();
	low.type = "lowpass";
	low.frequency.value = 140;
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, t);
	gain.gain.exponentialRampToValueAtTime(0.5, t + seconds * 0.6);
	gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
	src.connect(low).connect(gain).connect(ctx.destination);
	src.start(t);
	src.stop(t + seconds + 0.1);
}

/** A crack of thunder: a bright burst of noise falling away into a rolling tail. */
export function thunder() {
	if (!isSoundOn()) return;
	const ctx = audioContext();
	const t = ctx.currentTime;
	const src = ctx.createBufferSource();
	src.buffer = noise(ctx, 2.6, true);
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(2400, t);
	filter.frequency.exponentialRampToValueAtTime(160, t + 2.2);
	const gain = ctx.createGain();
	gain.gain.setValueAtTime(0.0001, t);
	gain.gain.exponentialRampToValueAtTime(0.7, t + 0.02);
	gain.gain.exponentialRampToValueAtTime(0.25, t + 0.4);
	gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
	src.connect(filter).connect(gain).connect(ctx.destination);
	src.start(t);
	src.stop(t + 2.6);
}

/** A dragon's roar: a growling saw sliding down in pitch, roughened with noise. */
export function roar() {
	if (!isSoundOn()) return;
	const ctx = audioContext();
	const t = ctx.currentTime;
	const length = 1.8;
	const out = ctx.createGain();
	out.gain.setValueAtTime(0.0001, t);
	out.gain.exponentialRampToValueAtTime(0.22, t + 0.15);
	out.gain.exponentialRampToValueAtTime(0.0001, t + length);
	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.setValueAtTime(1400, t);
	filter.frequency.exponentialRampToValueAtTime(380, t + length);
	filter.connect(out).connect(ctx.destination);
	for (const detune of [0, 7, -9]) {
		const osc = ctx.createOscillator();
		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(180 + detune, t);
		osc.frequency.exponentialRampToValueAtTime(70 + detune, t + length);
		osc.connect(filter);
		osc.start(t);
		osc.stop(t + length);
	}
	// A wobble, for the growl.
	const lfo = ctx.createOscillator();
	lfo.frequency.value = 26;
	const depth = ctx.createGain();
	depth.gain.value = 0.08;
	lfo.connect(depth).connect(out.gain);
	lfo.start(t);
	lfo.stop(t + length);
	const grit = ctx.createBufferSource();
	grit.buffer = noise(ctx, length);
	const band = ctx.createBiquadFilter();
	band.type = "bandpass";
	band.frequency.value = 600;
	grit.connect(band).connect(filter);
	grit.start(t);
	grit.stop(t + length);
}

/** Recorded sounds (CC0, in public/sounds), decoded once; until one loads, the synthesised version plays. */
const samples = new Map<string, AudioBuffer | null>();
function sample(name: string) {
	if (!samples.has(name)) {
		samples.set(name, null);
		fetch(`/sounds/${name}.ogg`)
			.then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
			.then((data) => audioContext().decodeAudioData(data))
			.then((buffer) => samples.set(name, buffer))
			.catch(() => {});
	}
	return samples.get(name) ?? null;
}
/** Starts fetching the summon's recordings, so they're ready when it comes. */
export function preloadSummon() {
	for (const name of ["dragon-roar", "thunder", "storm-wind"]) sample(name);
}

function playSample(buffer: AudioBuffer, gain: number, rate = 1) {
	const ctx = audioContext();
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.playbackRate.value = rate;
	const g = ctx.createGain();
	g.gain.value = gain;
	src.connect(g).connect(ctx.destination);
	src.start();
	return src;
}

/** The dragon's roar: the recording, slowed a little to make him bigger; else the synthesised one. */
export function bigRoar() {
	if (!isSoundOn()) return;
	const buffer = sample("dragon-roar");
	if (buffer) playSample(buffer, 0.9, 0.82);
	else {
		roar();
		window.setTimeout(roar, 350);
	}
}

/** Thunder: the recording if it's here, else the synthesised crack. */
export function bigThunder() {
	if (!isSoundOn()) return;
	const buffer = sample("thunder");
	if (buffer) playSample(buffer, 0.85);
	else thunder();
}

/** The storm wind under the summon, rising in and falling away; returns a stop. */
export function stormWind() {
	if (!isSoundOn()) return () => {};
	const ctx = audioContext();
	const out = ctx.createGain();
	out.gain.setValueAtTime(0.0001, ctx.currentTime);
	out.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 4);
	out.connect(ctx.destination);
	const buffer = sample("storm-wind");
	let src: AudioBufferSourceNode;
	if (buffer) {
		src = ctx.createBufferSource();
		src.buffer = buffer;
		src.loop = true;
		src.connect(out);
	} else {
		// Synthesised: noise through a slowly wandering band-pass, like wind round a building.
		src = ctx.createBufferSource();
		src.buffer = noise(ctx, 4, true);
		src.loop = true;
		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.Q.value = 0.7;
		band.frequency.value = 420;
		const lfo = ctx.createOscillator();
		lfo.frequency.value = 0.13;
		const depth = ctx.createGain();
		depth.gain.value = 260;
		lfo.connect(depth).connect(band.frequency);
		lfo.start();
		const boost = ctx.createGain();
		boost.gain.value = 0.6;
		src.connect(band).connect(boost).connect(out);
	}
	src.start();
	return () => {
		const now = ctx.currentTime;
		out.gain.cancelScheduledValues(now);
		out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), now);
		out.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
		window.setTimeout(() => {
			src.stop();
			out.disconnect();
		}, 2700);
	};
}

/** The balls' heartbeat as they glow up: a deep soft thump. */
export function heartbeat(level: number) {
	if (!isSoundOn()) return;
	const ctx = audioContext();
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	osc.frequency.setValueAtTime(70, t);
	osc.frequency.exponentialRampToValueAtTime(38, t + 0.25);
	const g = ctx.createGain();
	g.gain.setValueAtTime(0.0001, t);
	g.gain.exponentialRampToValueAtTime(0.15 + level * 0.3, t + 0.02);
	g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
	osc.connect(g).connect(ctx.destination);
	osc.start(t);
	osc.stop(t + 0.4);
}
