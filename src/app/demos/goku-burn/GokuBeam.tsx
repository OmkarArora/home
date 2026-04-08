"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { BeamPhase } from "./useGokuBeamLoop";

type Props = {
    frameOffset: number;
    beamPhase: BeamPhase;
    onBeamRectChange: (rect: DOMRect | null) => void;
};

export function GokuBeam({ frameOffset, beamPhase, onBeamRectChange }: Props) {
    const beamRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = beamRef.current;
        if (!node) return;

        let raf = 0;
        const emit = () => onBeamRectChange(node.getBoundingClientRect());

        const ro = new ResizeObserver(() => emit());
        ro.observe(node);
        emit();

        const onResize = () => emit();
        window.addEventListener("resize", onResize);

        const loop = () => {
            emit();
            raf = window.requestAnimationFrame(loop);
        };
        raf = window.requestAnimationFrame(loop);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", onResize);
            window.cancelAnimationFrame(raf);
            onBeamRectChange(null);
        };
    }, [onBeamRectChange]);

    return (
        <div className="relative h-[290px] w-[320px] shrink-0">
            <Image
                src="/images/sprites/goku-attack.png"
                alt="goku attack"
                width={320}
                height={290}
                className="goku-sprite"
                style={{ objectPosition: `${frameOffset}% 0%` }}
                priority
            />

            <div
                ref={beamRef}
                className={`kamehameha ${beamPhase === "active" ? "is-active" : ""} ${beamPhase === "fizzle" ? "is-fizzling" : ""}`}
            >
                <div className="beam-core" />
            </div>
        </div>
    );
}
