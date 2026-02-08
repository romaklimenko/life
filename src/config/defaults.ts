/**
 * Life Ecosystem Simulation - Configuration Defaults & Presets
 * 
 * Default parameter values and preset configurations for different
 * simulation scenarios.
 */

import { SimulationConfig, GrassConfig, SheepConfig, WolfConfig } from '../types';

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default grass configuration.
 * Based on ecological models: grass regrows relatively quickly.
 * lifeExpectancy affects how long individual grass patches persist.
 */
export const DEFAULT_GRASS_CONFIG: GrassConfig = {
    lifeExpectancy: 40,     // Short-lived grass forces constant regrowth
    initialCount: 2000,     // ~12% of grid covered initially
    spreadRate: 20,         // 20% chance to spread each tick
    spreadRadius: 2,        // Spread up to 2 cells away (Manhattan distance)
};

/**
 * Default sheep configuration.
 * Based on prey dynamics: moderate reproduction, vulnerable to starvation.
 * Sheep ratio to wolves should be roughly 10:1 for stability.
 */
export const DEFAULT_SHEEP_CONFIG: SheepConfig = {
    lifeExpectancy: 200,    // Long natural lifespan if well-fed
    initialCount: 400,      // ~6:1 ratio to wolves
    starvationTime: 10,     // Dies after 10 ticks without grass
    breedThreshold: 8,      // Needs to eat 8 grass to reproduce
    grazingRadius: 5,       // Detection range for grass
};

/**
 * Default wolf configuration.
 * Based on predator dynamics: fewer individuals, slower reproduction.
 * Wolves need successful hunts to survive and breed.
 */
export const DEFAULT_WOLF_CONFIG: WolfConfig = {
    lifeExpectancy: 250,    // Longer lifespan than sheep
    initialCount: 80,       // ~5:1 sheep-to-wolf ratio
    starvationTime: 50,     // Long survival between meals
    breedThreshold: 6,      // Needs to eat 6 sheep to reproduce
    huntingRadius: 4,       // Detection range for prey
};

/**
 * Default simulation configuration.
 * Values tuned for stable oscillating populations based on
 * Lotka-Volterra predator-prey dynamics.
 */
export const DEFAULT_CONFIG: SimulationConfig = {
    grass: DEFAULT_GRASS_CONFIG,
    sheep: DEFAULT_SHEEP_CONFIG,
    wolf: DEFAULT_WOLF_CONFIG,
    gameSpeed: 10,
};

// ============================================================================
// Presets
// ============================================================================

/**
 * Preset identifiers for quick configuration loading.
 */
export type PresetId = 'balanced' | 'predator-paradise' | 'peaceful-meadow' | 'survival-mode';

/**
 * Preset definition with ID, name, description, and config.
 */
export interface Preset {
    id: PresetId;
    name: string;
    description: string;
    config: SimulationConfig;
}

/**
 * Balanced preset - default settings for stable ecosystem.
 */
export const BALANCED_PRESET: Preset = {
    id: 'balanced',
    name: 'Balanced',
    description: 'Default balanced ecosystem',
    config: { ...DEFAULT_CONFIG },
};

/**
 * Predator Paradise - More wolves with larger hunting radius.
 * Based on predator-prey dynamics with higher predator density.
 * Features oscillating populations with dramatic swings.
 */
export const PREDATOR_PARADISE_PRESET: Preset = {
    id: 'predator-paradise',
    name: 'Predator Paradise',
    description: 'More wolves, dramatic population swings',
    config: {
        grass: {
            lifeExpectancy: 60,     // Longer-lived grass
            initialCount: 7000,     // More grass to support food chain
            spreadRate: 8,          // Faster regrowth
            spreadRadius: 3,        // Spread range
        },
        sheep: {
            lifeExpectancy: 100,
            initialCount: 600,      // More sheep to feed wolves
            starvationTime: 25,     // More resilient
            breedThreshold: 4,      // Faster breeding to survive predation
            grazingRadius: 3,       // Detection range for grass
        },
        wolf: {
            lifeExpectancy: 180,
            initialCount: 80,       // More wolves but balanced
            starvationTime: 35,     // Longer survival between meals
            breedThreshold: 3,      // Slower breeding than sheep
            huntingRadius: 6,       // Good hunting range
        },
        gameSpeed: 10,
    },
};

/**
 * Peaceful Meadow - Minimal wolf presence.
 * The challenge: keep wolves alive long enough to breed!
 * Too few wolves = immediate game over.
 */
export const PEACEFUL_MEADOW_PRESET: Preset = {
    id: 'peaceful-meadow',
    name: 'Peaceful Meadow',
    description: 'Few wolves, abundant sheep - keep wolves alive!',
    config: {
        grass: {
            lifeExpectancy: 80,     // Long-lived grass
            initialCount: 8000,     // Abundant food
            spreadRate: 10,         // Fast regrowth
            spreadRadius: 4,        // Wide spread range
        },
        sheep: {
            lifeExpectancy: 150,
            initialCount: 800,      // Lots of prey
            starvationTime: 40,     // Rarely starve
            breedThreshold: 3,      // Fast breeding
            grazingRadius: 4,       // Good foraging range
        },
        wolf: {
            lifeExpectancy: 200,
            initialCount: 10,       // Very few wolves - endangered!
            starvationTime: 50,     // Long survival to help them
            breedThreshold: 2,      // Easy breeding
            huntingRadius: 8,       // Large hunting range
        },
        gameSpeed: 10,
    },
};

/**
 * Survival Mode - Harsh conditions, scarce resources.
 * Based on stressed ecosystem dynamics.
 * High risk of extinction - the ultimate challenge!
 */
export const SURVIVAL_MODE_PRESET: Preset = {
    id: 'survival-mode',
    name: 'Survival Mode',
    description: 'Scarce resources, high mortality - ultimate challenge',
    config: {
        grass: {
            lifeExpectancy: 35,     // Short-lived grass
            initialCount: 3000,     // Less initial coverage
            spreadRate: 4,          // Slow regrowth
            spreadRadius: 2,        // Limited spread range
        },
        sheep: {
            lifeExpectancy: 70,     // Shorter lifespan
            initialCount: 250,      // Fewer sheep
            starvationTime: 15,     // Quick starvation
            breedThreshold: 5,      // Hard to reproduce
            grazingRadius: 2,       // Poor foraging in harsh conditions
        },
        wolf: {
            lifeExpectancy: 100,
            initialCount: 40,       // Balanced predator count
            starvationTime: 20,     // Quick starvation too
            breedThreshold: 4,      // Harder to breed
            huntingRadius: 6,       // Moderate hunting range
        },
        gameSpeed: 10,
    },
};

/**
 * All available presets.
 */
export const PRESETS: Preset[] = [
    BALANCED_PRESET,
    PREDATOR_PARADISE_PRESET,
    PEACEFUL_MEADOW_PRESET,
    SURVIVAL_MODE_PRESET,
];

/**
 * Gets a preset by ID.
 * @param id - Preset identifier
 * @returns The preset or undefined if not found
 */
export function getPreset(id: PresetId): Preset | undefined {
    return PRESETS.find(p => p.id === id);
}

/**
 * Gets a deep copy of a preset's configuration.
 * Useful for creating editable configs based on presets.
 * @param id - Preset identifier
 * @returns Deep copy of config or default config if not found
 */
export function getPresetConfig(id: PresetId): SimulationConfig {
    const preset = getPreset(id);
    if (!preset) {
        return { ...DEFAULT_CONFIG };
    }

    return {
        grass: { ...preset.config.grass },
        sheep: { ...preset.config.sheep },
        wolf: { ...preset.config.wolf },
        gameSpeed: preset.config.gameSpeed,
    };
}
