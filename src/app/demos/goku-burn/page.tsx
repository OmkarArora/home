"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ParagraphFlowWall } from "./ParagraphFlowWall";
import { useGokuBeamLoop } from "./useGokuBeamLoop";

const WALL_TEXT = `A shockwave ripples over the valley as he gathers everything into a single point of light. The beam arrives before the thunder, forcing the paragraph to bend away from its path while the page tries to preserve legibility. Lines that once sat still are displaced into tighter channels, then spill into new rows, then recompute once more as the pressure rises.

Inside this wall, Goku is treated as a live obstacle. Every line asks how much horizontal lane is still free at this y-position, and Pretext answers by streaming the next legal line for that width. The beam adds a second moving obstacle, which narrows the lane, pushes words to later rows, and changes rhythm mid-sentence.

As the attack fizzles, available width gradually returns. The paragraph settles back toward its natural wrapping, but the transition is continuous rather than a hard snap: row by row, width by width, cursor by cursor. This is the practical advantage of line-by-line layout APIs when text must coexist with animated geometry.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras in mi quis magna lobortis condimentum. Ut posuere imperdiet odio ac facilisis. Aliquam placerat iaculis dolor et mollis. Morbi maximus orci quis porttitor venenatis. Donec tristique nec tellus nec imperdiet. Praesent lobortis arcu mi, non consectetur odio venenatis vel. Sed scelerisque euismod euismod. Proin pharetra pharetra sagittis.
`;

type RectLike = { x: number; y: number; width: number; height: number };

const WALL_W = 980;
const WALL_H = 420;
const BASE_GOKU_RECT: RectLike = { x: 80, y: 100, width: 320, height: 290 };

export default function GokuBurnPage() {
    const loop = useGokuBeamLoop();
    const wallHostRef = useRef<HTMLDivElement | null>(null);
    const [wallWidth, setWallWidth] = useState(WALL_W);

    useEffect(() => {
        const node = wallHostRef.current;
        if (!node) return;
        const ro = new ResizeObserver(() => {
            const next = Math.max(640, Math.min(WALL_W, Math.floor(node.clientWidth)));
            setWallWidth(next);
        });
        ro.observe(node);
        setWallWidth(Math.max(640, Math.min(WALL_W, Math.floor(node.clientWidth))));
        return () => ro.disconnect();
    }, []);

    const scale = wallWidth / WALL_W;
    const gokuRect = useMemo<RectLike>(
        () => ({
            x: Math.round(BASE_GOKU_RECT.x * scale),
            y: Math.round(BASE_GOKU_RECT.y * scale),
            width: Math.round(BASE_GOKU_RECT.width * scale),
            height: Math.round(BASE_GOKU_RECT.height * scale),
        }),
        [scale],
    );

    const wallBeamRect = useMemo<RectLike | null>(() => {
        if (loop.phase === "idle") return null;
        return {
            x: gokuRect.x + Math.round(300 * scale),
            y: gokuRect.y + Math.round(140 * scale),
            width: Math.round(760 * scale),
            height: Math.max(20, Math.round(40 * scale)),
        };
    }, [gokuRect, loop.phase, scale]);

    return (
        <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
            <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
                <h1 className="text-2xl font-semibold tracking-tight">Goku Beam x Pretext Paragraph Flow</h1>
                <p className="max-w-4xl text-sm text-slate-300">
                    Goku is inside the text wall. Pretext routes lines around obstacle zones created by Goku and the
                    beam, so text wraps around the character and dynamically deforms during attack.
                </p>

                <section className="space-y-2">
                    <h2 className="text-sm font-medium text-cyan-300">Variable-width line routing with Pretext</h2>
                    <div ref={wallHostRef} className="relative w-full rounded-md border border-cyan-400/25 bg-slate-900/45 p-2">
                        <div className="relative" style={{ width: wallWidth, height: WALL_H }}>
                            <ParagraphFlowWall
                                width={wallWidth}
                                height={WALL_H}
                                text={WALL_TEXT}
                                gokuRect={gokuRect}
                                beamRect={wallBeamRect}
                                beamPhase={loop.phase}
                            />

                            <Image
                                src="/images/sprites/goku-attack.png"
                                alt="goku attack"
                                width={gokuRect.width}
                                height={gokuRect.height}
                                className="goku-sprite absolute"
                                style={{
                                    left: `${gokuRect.x}px`,
                                    top: `${gokuRect.y}px`,
                                    width: `${gokuRect.width}px`,
                                    height: `${gokuRect.height}px`,
                                    objectPosition: `${loop.frameOffsets[loop.frame]}% 0%`,
                                }}
                                priority
                            />

                            <div
                                className={`kamehameha absolute ${loop.phase === "active" ? "is-active" : ""} ${loop.phase === "fizzle" ? "is-fizzling" : ""}`}
                                style={{
                                    left: `${gokuRect.x + Math.round(300 * scale)}px`,
                                    top: `${gokuRect.y + Math.round(140 * scale)}px`,
                                    width: `${Math.round(760 * scale)}px`,
                                    height: `${Math.max(20, Math.round(40 * scale))}px`,
                                    borderRadius: `${Math.max(10, Math.round(20 * scale))}px`,
                                }}
                            >
                                <div className="beam-core" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
