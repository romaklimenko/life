/**
 * Life Ecosystem Simulation - Configuration Validation
 * 
 * Functions to validate simulation configuration parameters.
 * Ensures values are within acceptable ranges.
 */

import { SimulationConfig, GrassConfig, SheepConfig, WolfConfig } from '../types';

// ============================================================================
// Validation Ranges
// ============================================================================

/** Minimum and maximum values for configuration parameters */
export const CONFIG_RANGES = {
    grass: {
        lifeExpectancy: { min: 1, max: 500 },
        initialCount: { min: 0, max: 50000 },
        spreadRate: { min: 1, max: 100 },
    },
    sheep: {
        lifeExpectancy: { min: 1, max: 500 },
        initialCount: { min: 0, max: 5000 },
        starvationTime: { min: 1, max: 100 },
        breedThreshold: { min: 1, max: 20 },
    },
    wolf: {
        lifeExpectancy: { min: 1, max: 500 },
        initialCount: { min: 0, max: 1000 },
        starvationTime: { min: 1, max: 100 },
        breedThreshold: { min: 1, max: 10 },
        huntingRadius: { min: 1, max: 20 },
    },
    gameSpeed: { min: 1, max: 60 },
} as const;

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Result of a validation check.
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a value is within a range.
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param name - Parameter name for error message
 * @returns Error message or null if valid
 */
function validateRange(
    value: number,
    min: number,
    max: number,
    name: string
): string | null {
    if (typeof value !== 'number' || isNaN(value)) {
        return `${name} must be a number`;
    }
    if (value < min) {
        return `${name} must be at least ${min}`;
    }
    if (value > max) {
        return `${name} must be at most ${max}`;
    }
    return null;
}

/**
 * Validates grass configuration.
 * @param config - Grass config to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateGrassConfig(config: GrassConfig): string[] {
    const errors: string[] = [];
    const ranges = CONFIG_RANGES.grass;

    const lifeError = validateRange(
        config.lifeExpectancy,
        ranges.lifeExpectancy.min,
        ranges.lifeExpectancy.max,
        'Grass life expectancy'
    );
    if (lifeError) errors.push(lifeError);

    const countError = validateRange(
        config.initialCount,
        ranges.initialCount.min,
        ranges.initialCount.max,
        'Grass initial count'
    );
    if (countError) errors.push(countError);

    const spreadError = validateRange(
        config.spreadRate,
        ranges.spreadRate.min,
        ranges.spreadRate.max,
        'Grass spread rate'
    );
    if (spreadError) errors.push(spreadError);

    return errors;
}

/**
 * Validates sheep configuration.
 * @param config - Sheep config to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateSheepConfig(config: SheepConfig): string[] {
    const errors: string[] = [];
    const ranges = CONFIG_RANGES.sheep;

    const lifeError = validateRange(
        config.lifeExpectancy,
        ranges.lifeExpectancy.min,
        ranges.lifeExpectancy.max,
        'Sheep life expectancy'
    );
    if (lifeError) errors.push(lifeError);

    const countError = validateRange(
        config.initialCount,
        ranges.initialCount.min,
        ranges.initialCount.max,
        'Sheep initial count'
    );
    if (countError) errors.push(countError);

    const starvationError = validateRange(
        config.starvationTime,
        ranges.starvationTime.min,
        ranges.starvationTime.max,
        'Sheep starvation time'
    );
    if (starvationError) errors.push(starvationError);

    const breedError = validateRange(
        config.breedThreshold,
        ranges.breedThreshold.min,
        ranges.breedThreshold.max,
        'Sheep breed threshold'
    );
    if (breedError) errors.push(breedError);

    return errors;
}

/**
 * Validates wolf configuration.
 * @param config - Wolf config to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateWolfConfig(config: WolfConfig): string[] {
    const errors: string[] = [];
    const ranges = CONFIG_RANGES.wolf;

    const lifeError = validateRange(
        config.lifeExpectancy,
        ranges.lifeExpectancy.min,
        ranges.lifeExpectancy.max,
        'Wolf life expectancy'
    );
    if (lifeError) errors.push(lifeError);

    const countError = validateRange(
        config.initialCount,
        ranges.initialCount.min,
        ranges.initialCount.max,
        'Wolf initial count'
    );
    if (countError) errors.push(countError);

    const starvationError = validateRange(
        config.starvationTime,
        ranges.starvationTime.min,
        ranges.starvationTime.max,
        'Wolf starvation time'
    );
    if (starvationError) errors.push(starvationError);

    const breedError = validateRange(
        config.breedThreshold,
        ranges.breedThreshold.min,
        ranges.breedThreshold.max,
        'Wolf breed threshold'
    );
    if (breedError) errors.push(breedError);

    const huntingError = validateRange(
        config.huntingRadius,
        ranges.huntingRadius.min,
        ranges.huntingRadius.max,
        'Wolf hunting radius'
    );
    if (huntingError) errors.push(huntingError);

    return errors;
}

/**
 * Validates complete simulation configuration.
 * @param config - Full simulation config to validate
 * @returns Validation result with errors array
 */
export function validateConfig(config: SimulationConfig): ValidationResult {
    const errors: string[] = [];

    // Validate each section
    errors.push(...validateGrassConfig(config.grass));
    errors.push(...validateSheepConfig(config.sheep));
    errors.push(...validateWolfConfig(config.wolf));

    // Validate game speed
    const speedError = validateRange(
        config.gameSpeed,
        CONFIG_RANGES.gameSpeed.min,
        CONFIG_RANGES.gameSpeed.max,
        'Game speed'
    );
    if (speedError) errors.push(speedError);

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Clamps a value to within a range.
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Sanitizes a configuration by clamping all values to valid ranges.
 * @param config - Config to sanitize
 * @returns Sanitized config with all values in valid ranges
 */
export function sanitizeConfig(config: SimulationConfig): SimulationConfig {
    const r = CONFIG_RANGES;

    return {
        grass: {
            lifeExpectancy: clamp(config.grass.lifeExpectancy, r.grass.lifeExpectancy.min, r.grass.lifeExpectancy.max),
            initialCount: clamp(config.grass.initialCount, r.grass.initialCount.min, r.grass.initialCount.max),
            spreadRate: clamp(config.grass.spreadRate, r.grass.spreadRate.min, r.grass.spreadRate.max),
        },
        sheep: {
            lifeExpectancy: clamp(config.sheep.lifeExpectancy, r.sheep.lifeExpectancy.min, r.sheep.lifeExpectancy.max),
            initialCount: clamp(config.sheep.initialCount, r.sheep.initialCount.min, r.sheep.initialCount.max),
            starvationTime: clamp(config.sheep.starvationTime, r.sheep.starvationTime.min, r.sheep.starvationTime.max),
            breedThreshold: clamp(config.sheep.breedThreshold, r.sheep.breedThreshold.min, r.sheep.breedThreshold.max),
        },
        wolf: {
            lifeExpectancy: clamp(config.wolf.lifeExpectancy, r.wolf.lifeExpectancy.min, r.wolf.lifeExpectancy.max),
            initialCount: clamp(config.wolf.initialCount, r.wolf.initialCount.min, r.wolf.initialCount.max),
            starvationTime: clamp(config.wolf.starvationTime, r.wolf.starvationTime.min, r.wolf.starvationTime.max),
            breedThreshold: clamp(config.wolf.breedThreshold, r.wolf.breedThreshold.min, r.wolf.breedThreshold.max),
            huntingRadius: clamp(config.wolf.huntingRadius, r.wolf.huntingRadius.min, r.wolf.huntingRadius.max),
        },
        gameSpeed: clamp(config.gameSpeed, r.gameSpeed.min, r.gameSpeed.max),
    };
}
