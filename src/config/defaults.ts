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
 * Grass lives moderately long and spreads slowly.
 */
export const DEFAULT_GRASS_CONFIG: GrassConfig = {
    lifeExpectancy: 50,
    initialCount: 5000,
    spreadRate: 5,
};

/**
 * Default sheep configuration.
 * Sheep live longer than grass, need regular food.
 */
export const DEFAULT_SHEEP_CONFIG: SheepConfig = {
    lifeExpectancy: 100,
    initialCount: 500,
    starvationTime: 20,
    breedThreshold: 3,
};

/**
 * Default wolf configuration.
 * Wolves are apex predators with longer lifespans.
 */
export const DEFAULT_WOLF_CONFIG: WolfConfig = {
    lifeExpectancy: 150,
    initialCount: 50,
    starvationTime: 30,
    breedThreshold: 2,
    huntingRadius: 5,
};

/**
 * Default simulation configuration.
 * Balanced ecosystem with moderate game speed.
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
 * High predator pressure leads to dynamic population swings.
 */
export const PREDATOR_PARADISE_PRESET: Preset = {
    id: 'predator-paradise',
    name: 'Predator Paradise',
    description: 'More wolves, larger hunting radius',
    config: {
        grass: {
            lifeExpectancy: 40,
            initialCount: 6000,
            spreadRate: 8,
        },
        sheep: {
            lifeExpectancy: 80,
            initialCount: 800,
            starvationTime: 25,
            breedThreshold: 2,
        },
        wolf: {
            lifeExpectancy: 200,
            initialCount: 150,
            starvationTime: 40,
            breedThreshold: 1,
            huntingRadius: 8,
        },
        gameSpeed: 10,
    },
};

/**
 * Peaceful Meadow - No wolves, plenty of grass.
 * Watch sheep population boom and potentially crash.
 */
export const PEACEFUL_MEADOW_PRESET: Preset = {
    id: 'peaceful-meadow',
    name: 'Peaceful Meadow',
    description: 'No wolves, lots of grass',
    config: {
        grass: {
            lifeExpectancy: 80,
            initialCount: 8000,
            spreadRate: 10,
        },
        sheep: {
            lifeExpectancy: 120,
            initialCount: 200,
            starvationTime: 30,
            breedThreshold: 2,
        },
        wolf: {
            lifeExpectancy: 100,
            initialCount: 0, // No wolves!
            starvationTime: 20,
            breedThreshold: 2,
            huntingRadius: 5,
        },
        gameSpeed: 10,
    },
};

/**
 * Survival Mode - Scarce resources, fast deaths.
 * Challenging environment where populations struggle.
 */
export const SURVIVAL_MODE_PRESET: Preset = {
    id: 'survival-mode',
    name: 'Survival Mode',
    description: 'Scarce resources, fast deaths',
    config: {
        grass: {
            lifeExpectancy: 30,
            initialCount: 2000,
            spreadRate: 2,
        },
        sheep: {
            lifeExpectancy: 60,
            initialCount: 300,
            starvationTime: 10,
            breedThreshold: 5,
        },
        wolf: {
            lifeExpectancy: 80,
            initialCount: 80,
            starvationTime: 15,
            breedThreshold: 3,
            huntingRadius: 7,
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
