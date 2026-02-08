/**
 * Life Ecosystem Simulation - Canvas Renderer
 * 
 * High-performance grid rendering using HTML5 Canvas.
 * Uses ImageData for pixel-level manipulation without draw calls.
 */

import { EntityType, GRID_WIDTH, GRID_HEIGHT, GRID_SIZE } from '../types';
import { Grid } from '../simulation/grid';
import { ENTITY_COLORS } from './colors';

/**
 * Renderer handles drawing the simulation grid to a canvas.
 * 
 * Performance optimizations:
 * - Uses ImageData for direct pixel manipulation
 * - Pre-calculates color lookups
 * - Minimizes canvas context calls
 */
export class Renderer {
    /** Canvas element */
    private canvas: HTMLCanvasElement;

    /** 2D rendering context */
    private ctx: CanvasRenderingContext2D;

    /** ImageData buffer for pixel manipulation */
    private imageData: ImageData;

    /** Uint8ClampedArray view of pixel data */
    private pixels: Uint8ClampedArray;

    /**
     * Creates a new Renderer.
     * @param canvas - Canvas element to render to (should be 255x255)
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // Ensure canvas is correct size
        this.canvas.width = GRID_WIDTH;
        this.canvas.height = GRID_HEIGHT;

        // Get 2D context with alpha disabled for performance
        const ctx = this.canvas.getContext('2d', { alpha: false });
        if (!ctx) {
            throw new Error('Failed to get 2D canvas context');
        }
        this.ctx = ctx;

        // Disable image smoothing for crisp pixel rendering
        this.ctx.imageSmoothingEnabled = false;

        // Create ImageData buffer
        this.imageData = this.ctx.createImageData(GRID_WIDTH, GRID_HEIGHT);
        this.pixels = this.imageData.data;

        // Initialize with background color
        this.clear();
    }

    /**
     * Clears the canvas to the background color.
     */
    clear(): void {
        const bg = ENTITY_COLORS[EntityType.EMPTY];

        for (let i = 0; i < GRID_SIZE; i++) {
            const offset = i * 4;
            this.pixels[offset] = bg.r;
            this.pixels[offset + 1] = bg.g;
            this.pixels[offset + 2] = bg.b;
            this.pixels[offset + 3] = bg.a;
        }

        this.ctx.putImageData(this.imageData, 0, 0);
    }

    /**
     * Renders the current grid state to the canvas.
     * @param grid - The simulation grid to render
     */
    render(grid: Grid): void {
        const typeGrid = grid.getTypeGrid();

        // Update pixel buffer from grid state
        for (let i = 0; i < GRID_SIZE; i++) {
            const entityType = typeGrid[i] as EntityType;
            const color = ENTITY_COLORS[entityType];
            const offset = i * 4;

            this.pixels[offset] = color.r;
            this.pixels[offset + 1] = color.g;
            this.pixels[offset + 2] = color.b;
            this.pixels[offset + 3] = color.a;
        }

        // Push updated pixels to canvas
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    /**
     * Gets the canvas element.
     */
    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }
}
