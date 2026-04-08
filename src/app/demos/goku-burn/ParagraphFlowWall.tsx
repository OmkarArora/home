"use client";

import {
    layoutNextLine,
    prepareWithSegments,
    type LayoutCursor,
} from "@chenglou/pretext";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BeamPhase } from "./useGokuBeamLoop";

type RectLike = { x: number; y: number; width: number; height: number };

type Props = {
    width: number;
    height: number;
    text: string;
    gokuRect: RectLike;
    beamRect: RectLike | null;
    beamPhase: BeamPhase;
};

const PAD_X = 20;
const PAD_Y = 20;
const FONT = '16px "Times New Roman"';
const LINE_HEIGHT = 24;
const MIN_LINE_WIDTH = 120;

type Segment = { x: number; width: number };
type FlowLine = { text: string; x: number; y: number; isHot: boolean };

function intersectsY(rect: RectLike, lineTop: number, lineBottom: number) {
    return lineBottom > rect.y && lineTop < rect.y + rect.height;
}

function getWidestFreeSegment(contentLeft: number, contentRight: number, blocked: RectLike[]): Segment | null {
    if (contentRight <= contentLeft) return null;

    const intervals = blocked
        .map((b) => ({
            start: Math.max(contentLeft, b.x),
            end: Math.min(contentRight, b.x + b.width),
        }))
        .filter((i) => i.end > i.start)
        .sort((a, b) => a.start - b.start);

    const merged: Array<{ start: number; end: number }> = [];
    for (const it of intervals) {
        const last = merged[merged.length - 1];
        if (!last || it.start > last.end) merged.push({ ...it });
        else last.end = Math.max(last.end, it.end);
    }

    let cursor = contentLeft;
    let widest: Segment | null = null;
    for (const m of merged) {
        if (m.start > cursor) {
            const seg = { x: cursor, width: m.start - cursor };
            if (!widest || seg.width > widest.width) widest = seg;
        }
        cursor = Math.max(cursor, m.end);
    }

    if (cursor < contentRight) {
        const seg = { x: cursor, width: contentRight - cursor };
        if (!widest || seg.width > widest.width) widest = seg;
    }

    return widest ?? { x: contentLeft, width: contentRight - contentLeft };
}

export function ParagraphFlowWall({ width, height, text, gokuRect, beamRect, beamPhase }: Props) {
    const preparedRef = useRef<ReturnType<typeof prepareWithSegments> | null>(null);
    const [lines, setLines] = useState<FlowLine[]>([]);
    const [intensity, setIntensity] = useState(0);

    const contentLeft = PAD_X;
    const contentRight = width - PAD_X;
    const contentWidth = Math.max(1, contentRight - contentLeft);

    const canMeasure = useMemo(() => {
        if (typeof OffscreenCanvas !== "undefined") return true;
        if (typeof document === "undefined") return false;
        return !!document.createElement("canvas").getContext;
    }, []);

    useEffect(() => {
        if (!canMeasure) return;
        preparedRef.current = prepareWithSegments(text, FONT, { whiteSpace: "normal" });
    }, [canMeasure, text]);

    useEffect(() => {
        let raf = 0;
        const tick = () => {
            setIntensity((curr) => {
                if (beamPhase === "active") return Math.min(1, curr + 0.08);
                if (beamPhase === "fizzle") return Math.max(0, curr - 0.03);
                return Math.max(0, curr - 0.02);
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [beamPhase]);

    useEffect(() => {
        const prepared = preparedRef.current;
        if (!prepared) return;

        const nextLines: FlowLine[] = [];
        let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = PAD_Y;
        while (y < height - PAD_Y) {
            const lineTop = y;
            const lineBottom = y + LINE_HEIGHT;

            const blocked: RectLike[] = [];
            if (intersectsY(gokuRect, lineTop, lineBottom)) {
                blocked.push({
                    x: gokuRect.x - 8,
                    y: gokuRect.y,
                    width: gokuRect.width + 16,
                    height: gokuRect.height,
                });
            }
            if (beamRect && intensity > 0.02 && intersectsY(beamRect, lineTop, lineBottom)) {
                blocked.push({
                    x: beamRect.x,
                    y: beamRect.y - beamRect.height * 0.2,
                    width: beamRect.width,
                    height: beamRect.height * (1 + intensity * 0.8),
                });
            }

            const segment = getWidestFreeSegment(contentLeft, contentRight, blocked);
            if (!segment) break;

            // Never let a line "cheat" through obstacles by falling back to full width.
            // If the free lane is too narrow this row, wait for the next row.
            if (segment.width < 36) {
                y += LINE_HEIGHT;
                continue;
            }

            const lane = { x: segment.x, width: Math.max(36, Math.min(contentWidth, segment.width)) };
            const lineMaxWidth = lane.width;

            const line = layoutNextLine(prepared, cursor, lineMaxWidth);
            if (line === null) break;
            cursor = line.end;

            const beamCenterY = beamRect ? beamRect.y + beamRect.height / 2 : -99999;
            const influenceRadius = beamRect ? Math.max(60, beamRect.height * 3.2) : 1;
            const distance = Math.abs(y + LINE_HEIGHT * 0.5 - beamCenterY);
            const influence = Math.max(0, 1 - distance / influenceRadius);

            nextLines.push({
                text: line.text,
                x: lane.x,
                y,
                isHot: influence > 0.2,
            });
            y += LINE_HEIGHT;
        }

        setLines(nextLines);
    }, [beamRect, contentLeft, contentRight, contentWidth, gokuRect, height, intensity, width]);

    const glowStyle = useMemo(() => {
        if (!beamRect || intensity <= 0.02) return { opacity: 0 } as const;
        const glowY = beamRect.y + beamRect.height / 2;
        const glowH = Math.max(30, beamRect.height * 1.8);
        return {
            opacity: Math.min(1, 0.85 * intensity),
            top: `${glowY - glowH / 2}px`,
            left: `${PAD_X}px`,
            width: `${Math.max(0, width - PAD_X * 2)}px`,
            height: `${glowH}px`,
            background:
                "linear-gradient(90deg, rgba(0,234,255,0) 0%, rgba(0,234,255,0.20) 22%, rgba(145,248,255,0.30) 70%, rgba(0,234,255,0) 100%)",
        } as const;
    }, [beamRect, intensity, width]);

    return (
        <div
            className="relative overflow-hidden rounded-md border border-cyan-400/30 bg-slate-950/70"
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {lines.map((line, idx) => (
                <div
                    key={`${idx}-${line.y}`}
                    className="absolute whitespace-pre"
                    style={{
                        left: `${line.x}px`,
                        top: `${line.y}px`,
                        font: FONT,
                        lineHeight: `${LINE_HEIGHT}px`,
                        color: line.isHot ? "rgba(177,236,255,0.96)" : "rgba(229,233,244,0.96)",
                        textShadow: line.isHot ? "0 0 10px rgba(123,232,255,0.3)" : "none",
                    }}
                >
                    {line.text}
                </div>
            ))}
            <div className="pointer-events-none absolute" style={glowStyle} />
        </div>
    );
}
