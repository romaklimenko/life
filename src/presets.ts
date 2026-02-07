
import { DEFAULT_CONFIG } from './types';
import type { SimulationConfig } from './types';

export const PRESETS: Record<string, Partial<SimulationConfig>> = {
    balanced: {}, // Uses defaults
    explosive: {
        sheepReproductionThreshold: 5,
        wolfReproductionThreshold: 10,
        grassRegrowthRate: 10, // Higher grass = more food
        sheepInitialCount: 200,
        wolfInitialCount: 20
    },
    apocalypse: {
        wolfInitialCount: 200,
        wolfHuntingRadius: 50,
        wolfLifeExpectancy: 300,
        sheepInitialCount: 1000,
        sheepReproductionThreshold: 20 // Harder for sheep to breed
    },
    scarcity: {
        grassRegrowthRate: 0.5,
        sheepEnergyDecay: 2,
        wolfEnergyDecay: 2
    }
};

export const applyPreset = (name: string): SimulationConfig => {
    const change = PRESETS[name];
    if (!change) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...change };
};
