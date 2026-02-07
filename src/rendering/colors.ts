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
 * Sheep color - warm cream/white.
 */
export const COLOR_SHEEP: RGBA = { r: 254, g: 243, b: 199, a: 255 };

/**
 * Wolf color - dark gray with slight blue tint.
 */
export const COLOR_WOLF: RGBA = { r: 75, g: 85, b: 99, a: 255 };

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
    sheep: 'rgb(254, 243, 199)',
    wolf: 'rgb(75, 85, 99)',

    // Chart line colors with transparency for stacking
    grassLine: 'rgba(74, 222, 128, 0.9)',
    sheepLine: 'rgba(254, 243, 199, 0.9)',
    wolfLine: 'rgba(200, 200, 220, 0.9)',

    // Fill colors for chart area
    grassFill: 'rgba(74, 222, 128, 0.2)',
    sheepFill: 'rgba(254, 243, 199, 0.2)',
    wolfFill: 'rgba(200, 200, 220, 0.2)',
};
