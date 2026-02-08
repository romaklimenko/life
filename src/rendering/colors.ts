/**
 * Life Ecosystem Simulation - Color Scheme
 * 
 * Defines a modern, vibrant color palette for entity visualization.
 * Uses a dark theme optimized for visual clarity.
 */

import { EntityType } from '../types';

// ============================================================================
// Color Definitions (RGBA values for ImageData manipulation)
// ============================================================================

/**
 * Color represented as RGBA values (0-255).
 */
export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * Background color - deep dark for contrast.
 */
export const COLOR_EMPTY: RGBA = { r: 15, g: 15, b: 25, a: 255 };

/**
 * Grass color - vibrant green.
 */
export const COLOR_GRASS: RGBA = { r: 74, g: 222, b: 128, a: 255 };

/**
 * Sheep color - white/off-white.
 */
export const COLOR_SHEEP: RGBA = { r: 245, g: 245, b: 240, a: 255 };

/**
 * Wolf color - red.
 */
export const COLOR_WOLF: RGBA = { r: 220, g: 60, b: 60, a: 255 };

/**
 * Entity color lookup array for fast access.
 * Index matches EntityType enum values.
 */
export const ENTITY_COLORS: RGBA[] = [
    COLOR_EMPTY,  // EntityType.EMPTY = 0
    COLOR_GRASS,  // EntityType.GRASS = 1
    COLOR_SHEEP,  // EntityType.SHEEP = 2
    COLOR_WOLF,   // EntityType.WOLF = 3
];

/**
 * Gets the color for an entity type.
 * @param type - Entity type
 * @returns RGBA color
 */
export function getEntityColor(type: EntityType): RGBA {
    return ENTITY_COLORS[type] ?? COLOR_EMPTY;
}

// ============================================================================
// CSS Color Strings (for UI elements)
// ============================================================================

export const CSS_COLORS = {
    empty: 'rgb(15, 15, 25)',
    grass: 'rgb(74, 222, 128)',
    sheep: 'rgb(245, 245, 240)',
    wolf: 'rgb(220, 60, 60)',

    // Chart line colors with transparency for stacking
    grassLine: 'rgba(74, 222, 128, 0.9)',
    sheepLine: 'rgba(245, 245, 240, 0.9)',
    wolfLine: 'rgba(220, 60, 60, 0.9)',

    // Fill colors for chart area
    grassFill: 'rgba(74, 222, 128, 0.2)',
    sheepFill: 'rgba(245, 245, 240, 0.2)',
    wolfFill: 'rgba(220, 60, 60, 0.2)',
};
