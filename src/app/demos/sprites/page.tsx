"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const TOTAL_FRAMES = 3;
const PREP_MS = 1500;
const BEAM_SECONDS = 2;
const FIZZLE_MS = 280;
const COOLDOWN_MS = 500;

export default function Page() {
    const [frame, setFrame] = useState(0);
    const [beamActive, setBeamActive] = useState(false);
    const [beamFizzling, setBeamFizzling] = useState(false);

    const frameOffsets = useMemo(
        () => Array.from({ length: TOTAL_FRAMES }, (_, i) => (i / (TOTAL_FRAMES - 1)) * 100),
        [],
    );

    useEffect(() => {
        let cancelled = false;
        const timers = new Set<number>();
        const beamMs = BEAM_SECONDS * 1000;
        const frameStepMs = PREP_MS / (TOTAL_FRAMES - 1);

        const schedule = (delayMs: number, cb: () => void) => {
            const id = window.setTimeout(() => {
                timers.delete(id);
                if (!cancelled) cb();
            }, delayMs);
            timers.add(id);
        };

        const runLoop = () => {
            setBeamActive(false);
            setBeamFizzling(false);
            setFrame(0);

            for (let i = 1; i < TOTAL_FRAMES; i++) {
                schedule(frameStepMs * i, () => setFrame(i));
            }

            schedule(PREP_MS, () => setBeamActive(true));
            schedule(PREP_MS + beamMs, () => {
                setBeamActive(false);
                setBeamFizzling(true);
            });
            schedule(PREP_MS + beamMs + FIZZLE_MS, () => setBeamFizzling(false));
            schedule(PREP_MS + beamMs + FIZZLE_MS + COOLDOWN_MS, runLoop);
        };

        runLoop();

        return () => {
            cancelled = true;
            for (const id of timers) window.clearTimeout(id);
            timers.clear();
        };
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center bg-red-200">
            <div className="relative">
                <Image
                    src="/images/sprites/goku-attack.png"
                    alt="goku attack"
                    width={320}
                    height={290}
                    className="goku-sprite"
                    style={{ objectPosition: `${frameOffsets[frame]}% 0%` }}
                    priority
                />

                <div
                    className={`kamehameha ${beamActive ? "is-active" : ""} ${beamFizzling ? "is-fizzling" : ""}`}
                >
                    <div className="beam-core" />
                </div>
            </div>
        </div>
    );
}
