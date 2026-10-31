"use client";

import type { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef } from "react";
import { type Camera, type PerspectiveCamera, Spherical, Vector3 } from "three";


import { whoosh } from "./ambience";
import { type ViewKey, views } from "./views";

/**
 * Takes the camera from view to view (`views.ts`): position and look-at point
 * move together for 1.4 s, easing in and out, swinging round what's in front
 * rather than cutting through it. Looking about is off while it flies, then
 * held to the new view's limits. The scene opens on the first view, no flight.
 * Left alone in the wide view, it drifts a hair side to side. Says when it
 * lands (`onArrive`), so a sequence can follow on.
 */

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;

/** What a thing in the scene needs to send you somewhere, and to say where on hover. */
export const ViewContext = createContext<{
	view: ViewKey;
	go: (view: ViewKey) => void;
	hover: (view: ViewKey | null) => void;
	/** What a hovered control does, for the HUD (null when nothing's hovered). */
	say: (text: string | null) => void;
	/** Whether the record player is playing, and how to start or stop it. */
	record: boolean;
	toggleRecord: () => void;
	/** A credit, silently (the hologram's coin gives one when clicked, with its own bling). */
	coin: () => void;
}>({ view: "wide", go: () => {}, hover: () => {}, say: () => {}, record: false, toggleRecord: () => {}, coin: () => {} });
export const useView = () => useContext(ViewContext);

const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** How much further back to stand on a portrait screen so a view's width still fits (1 on a landscape one). */
const reach = (camera: Camera) => {
	const aspect = (camera as PerspectiveCamera).aspect ?? 1.6;
	return aspect >= 1.2 ? 1 : Math.min(1.8, (1.2 / aspect) ** 0.8);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Flight = { from: { target: Vector3; offset: Spherical }; to: { target: Vector3; offset: Spherical }; t: number; seconds: number };

export function CameraRig({
	view,
	controls,
	panel,
	slow = false,
	onArrive,
	hold,
	again = 0,
}: {
	/** While true, something else (the dragon's flight) has the camera; the rig keeps its hands off. */
	hold?: React.RefObject<boolean>;
	/** Bump to fly to the current view again from wherever the camera's been taken. */
	again?: number;
	view: ViewKey;
	controls: React.RefObject<OrbitControlsImpl | null>;
	panel: boolean;
	/** Take this flight slowly (the reveal at the end of the intro). */
	slow?: boolean;
	/** Called as the camera lands on a view. */
	onArrive?: (view: ViewKey) => void;
}) {
	const camera = useThree((s) => s.camera);
	const flight = useRef<Flight | null>(null);
	const first = useRef(true);
	const touched = useRef(0);
	const scratch = useRef({ offset: new Vector3(), sphere: new Spherical() });

	// Any drag or zoom counts as being looked after; the drift waits.
	useEffect(() => {
		const c = controls.current;
		if (!c) return;
		const touch = () => (touched.current = performance.now());
		c.addEventListener("start", touch);
		c.addEventListener("end", touch);
		return () => {
			c.removeEventListener("start", touch);
			c.removeEventListener("end", touch);
		};
	}, [controls]);

	useEffect(() => {
		const c = controls.current;
		if (!c) return;
		const goal = views[view];
		const wide = window.innerWidth >= 768;
		// With the panel open the cabinet slides left of centre, to sit in the space beside it; on a
		// phone the panel is a sheet along the bottom, so the view drops a little to lift it above.
		const shift = panel && goal.shift && wide ? goal.shift : 0;
		const lift = panel && !wide ? 0.32 : 0;
		const target = new Vector3(...goal.target).add(new Vector3(shift, -lift, 0));
		const position = new Vector3(...goal.position).add(new Vector3(shift, -lift, 0));
		const offset = new Spherical().setFromVector3(position.clone().sub(target));
		// A tall, narrow screen sees less across: step back so the same width fits.
		offset.radius *= reach(camera);

		// The first view is where the scene opens: the camera starts there, no flight.
		const opening = first.current;
		if (opening) {
			camera.position.copy(position);
			c.target.copy(target);
		}
		const seconds = slow ? 2.6 : 1.4;
		if (!opening) whoosh(seconds);
		first.current = false;

		// Free while flying, so the limits of the last view don't snag the move.
		Object.assign(c, { minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity, minPolarAngle: 0, maxPolarAngle: Math.PI, minDistance: 0, maxDistance: Infinity });
		const from = { target: c.target.clone(), offset: new Spherical().setFromVector3(camera.position.clone().sub(c.target)) };
		// Round the short way.
		const turn = offset.theta - from.offset.theta;
		offset.theta = from.offset.theta + Math.atan2(Math.sin(turn), Math.cos(turn));
		flight.current = { from, to: { target, offset }, t: still() || opening ? 1 : 0, seconds };
		c.enabled = false;
	}, [view, panel, camera, controls, again]);

	useFrame(({ clock }, dt) => {
		const c = controls.current;
		if (!c || hold?.current) return;
		const f = flight.current;
		const { offset, sphere } = scratch.current;
		if (f) {
			f.t = Math.min(1, f.t + dt / f.seconds);
			const k = ease(f.t);
			c.target.lerpVectors(f.from.target, f.to.target, k);
			sphere.set(
				f.from.offset.radius + (f.to.offset.radius - f.from.offset.radius) * k,
				f.from.offset.phi + (f.to.offset.phi - f.from.offset.phi) * k,
				f.from.offset.theta + (f.to.offset.theta - f.from.offset.theta) * k,
			);
			camera.position.copy(c.target).add(offset.setFromSpherical(sphere));
			camera.lookAt(c.target);
			if (f.t >= 1) {
				// Landed: hold the view to its limits and hand it back.
				const goal = views[view];
				const home = f.to.offset.theta;
				Object.assign(c, {
					minAzimuthAngle: goal.swing === null ? -Infinity : home - goal.swing,
					maxAzimuthAngle: goal.swing === null ? Infinity : home + goal.swing,
					minPolarAngle: goal.polar[0],
					maxPolarAngle: goal.polar[1],
					minDistance: goal.distance[0] * reach(camera),
					maxDistance: goal.distance[1] * reach(camera),
				});
				flight.current = null;
				c.enabled = true;
				onArrive?.(view);
				c.update();
				touched.current = performance.now();
			}
			return;
		}
		// The drift: only in the wide view, only after 10 s untouched, a few degrees each way round wherever you are.
		if (view !== "wide" || still() || performance.now() - touched.current < 10000) return;
		offset.copy(camera.position).sub(c.target);
		sphere.setFromVector3(offset);
		sphere.theta += Math.cos(clock.elapsedTime * 0.15) * 0.06 * 0.15 * dt;
		camera.position.copy(c.target).add(offset.setFromSpherical(sphere));
		// Before the controls update (priority -1) and the screen is fitted (0), so both see this frame's camera.
	}, -2);

	return null;
}
