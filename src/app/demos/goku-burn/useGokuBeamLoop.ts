"use client";

import { useEffect, useMemo, useState } from "react";

export type BeamPhase = "idle" | "active" | "fizzle";

const TOTAL_FRAMES = 3;
const PREP_MS = 1500;
const BEAM_MS = 2000;
const FIZZLE_MS = 280;
const COOLDOWN_MS = 500;

export function useGokuBeamLoop() {
    const [frame, setFrame] = useState(0);
    const [phase, setPhase] = useState<BeamPhase>("idle");

    const frameOffsets = useMemo(
        () => Array.from({ length: TOTAL_FRAMES }, (_, i) => (i / (TOTAL_FRAMES - 1)) * 100),
        [],
    );

    useEffect(() => {
        let cancelled = false;
        const timers = new Set<number>();
        const frameStepMs = PREP_MS / (TOTAL_FRAMES - 1);

        const schedule = (delayMs: number, cb: () => void) => {
            const id = window.setTimeout(() => {
                timers.delete(id);
                if (!cancelled) cb();
            }, delayMs);
            timers.add(id);
        };

        const runLoop = () => {
            setPhase("idle");
            setFrame(0);

            for (let i = 1; i < TOTAL_FRAMES; i++) {
                schedule(frameStepMs * i, () => setFrame(i));
            }

            schedule(PREP_MS, () => setPhase("active"));
            schedule(PREP_MS + BEAM_MS, () => setPhase("fizzle"));
            schedule(PREP_MS + BEAM_MS + FIZZLE_MS, () => setPhase("idle"));
            schedule(PREP_MS + BEAM_MS + FIZZLE_MS + COOLDOWN_MS, runLoop);
        };

        runLoop();

        return () => {
            cancelled = true;
            for (const id of timers) window.clearTimeout(id);
            timers.clear();
        };
    }, []);

    return {
        frame,
        frameOffsets,
        phase,
        beamActive: phase === "active",
        beamFizzling: phase === "fizzle",
    };
}
