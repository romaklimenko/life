
import React, { useEffect, useRef } from 'react';
import { World } from '../engine/world';
import { ENTITY_GRASS, ENTITY_SHEEP, ENTITY_WOLF } from '../types';

interface GameCanvasProps {
    world: World;
    running: boolean;
    generation: number; // Trigger re-render if manual step
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ world, running, generation }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameIdRef = useRef<number>(0);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize
        if (!ctx) return;

        const { width, height, typeGrid } = world;

        // Use ImageData for performance (manipulating pixels directly)
        // 255x255 = 65k pixels.
        // If we want each cell to be 1 pixel on screen, canvas size = 255x255.
        // We can scale it up with CSS.

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data; // Uint8ClampedArray

        // Colors (R, G, B, A)
        // Empty: Black/Dark Grey (#1a1a1a -> 26, 26, 26)
        // Grass: Green (#4ade80 -> 74, 222, 128)
        // Sheep: White (#ffffff -> 255, 255, 255)
        // Wolf: Red (#ef4444 -> 239, 68, 68)

        for (let i = 0; i < world.size; i++) {
            const type = typeGrid[i];
            const idx = i * 4;

            if (type === ENTITY_SHEEP) {
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = 255;
            } else if (type === ENTITY_WOLF) {
                data[idx] = 239;
                data[idx + 1] = 68;
                data[idx + 2] = 68;
                data[idx + 3] = 255;
            } else if (type === ENTITY_GRASS) {
                data[idx] = 74;
                data[idx + 1] = 222;
                data[idx + 2] = 128;
                data[idx + 3] = 255;
            } else {
                // Empty
                data[idx] = 26;
                data[idx + 1] = 26;
                data[idx + 2] = 26;
                data[idx + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);
    };

    useEffect(() => {
        // Draw once on mount or generation change
        draw();
    }, [world, generation]);

    useEffect(() => {
        if (!running) {
            cancelAnimationFrame(frameIdRef.current);
            return;
        }

        const loop = (_time: number) => {
            // throttle limit? App manages ticks. GameCanvas just draws.
            // If App updates World continuously, we just draw continuously.
            // Actually, we should sync draw with world updates.
            // But if World.update() is called in a separate interval loop in App,
            // we can just loop draw here on RAF.

            draw();
            frameIdRef.current = requestAnimationFrame(loop);
        };

        frameIdRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(frameIdRef.current);
    }, [running, world]); // if world instance changes

    return (
        <div className="canvas-container" style={{
            width: '100%',
            maxWidth: '600px',
            aspectRatio: '1',
            margin: '0 auto',
            border: '2px solid #333',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            <canvas
                ref={canvasRef}
                width={world.width}
                height={world.height}
                style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated' // Crucial for crisp pixels
                }}
            />
        </div>
    );
};
