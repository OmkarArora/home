"use client";

import type { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useRef } from "react";
import { Spherical, Vector3 } from "three";

import { play } from "@/components/site/sound";

import { type ViewKey, intro, views } from "./views";

/**
 * Takes the camera from view to view (`views.ts`): position and look-at point
 * move together for 1.4 s, easing in and out, swinging round what's in front
 * rather than cutting through it. Looking about is off while it flies, then
 * held to the new view's limits. The first view is flown into from far off.
 * Left alone in the wide view, it drifts a hair side to side.
 */

type OrbitControlsImpl = React.ComponentRef<typeof OrbitControls>;

/** What a thing in the scene needs to send you somewhere, and to say where on hover. */
export const ViewContext = createContext<{ view: ViewKey; go: (view: ViewKey) => void; hover: (view: ViewKey | null) => void }>({
	view: "wide",
	go: () => {},
	hover: () => {},
});
export const useView = () => useContext(ViewContext);

const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

type Flight = { from: { target: Vector3; offset: Spherical }; to: { target: Vector3; offset: Spherical }; t: number; seconds: number };

export function CameraRig({ view, controls, panel }: { view: ViewKey; controls: React.RefObject<OrbitControlsImpl | null>; panel: boolean }) {
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
		// With the panel open the cabinet slides left of centre, to sit in the space beside it.
		const shift = panel && goal.shift && window.innerWidth >= 768 ? goal.shift : 0;
		const target = new Vector3(...goal.target).setX(goal.target[0] + shift);
		const position = new Vector3(...goal.position).setX(goal.position[0] + shift);
		const offset = new Spherical().setFromVector3(position.clone().sub(target));

		if (first.current) camera.position.set(...intro);
		const seconds = first.current ? 2.4 : 1.4;
		if (!first.current) play("glide");
		first.current = false;

		// Free while flying, so the limits of the last view don't snag the move.
		Object.assign(c, { minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity, minPolarAngle: 0, maxPolarAngle: Math.PI, minDistance: 0, maxDistance: Infinity });
		const from = { target: c.target.clone(), offset: new Spherical().setFromVector3(camera.position.clone().sub(c.target)) };
		// Round the short way.
		const turn = offset.theta - from.offset.theta;
		offset.theta = from.offset.theta + Math.atan2(Math.sin(turn), Math.cos(turn));
		flight.current = { from, to: { target, offset }, t: still() ? 1 : 0, seconds };
		c.enabled = false;
	}, [view, panel, camera, controls]);

	useFrame(({ clock }, dt) => {
		const c = controls.current;
		if (!c) return;
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
					minDistance: goal.distance[0],
					maxDistance: goal.distance[1],
				});
				flight.current = null;
				c.enabled = true;
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
