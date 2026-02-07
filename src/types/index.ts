export type EntityType = 0 | 1 | 2 | 3;
// 0 = Empty, 1 = Grass, 2 = Sheep, 3 = Wolf

export const ENTITY_EMPTY = 0;
export const ENTITY_GRASS = 1;
export const ENTITY_SHEEP = 2;
export const ENTITY_WOLF = 3;

export interface SimulationConfig {
    gridSize: number;
    gameSpeed: number; // Ticks per second

    // Grass
    grassLifeExpectancy: number; // ticks (optional, maybe effectively infinite)
    grassRegrowthRate: number; // Probability 0-1 per empty cell per tick, or neighbor based

    // Sheep
    sheepLifeExpectancy: number;
    sheepEnergyDecay: number; // Energy lost per tick
    sheepReproductionThreshold: number; // Energy/Food needed to reproduce
    sheepInitialCount: number;

    // Wolf
    wolfLifeExpectancy: number;
    wolfEnergyDecay: number;
    wolfReproductionThreshold: number;
    wolfHuntingRadius: number;
    wolfInitialCount: number;
}

export const DEFAULT_CONFIG: SimulationConfig = {
    gridSize: 255,
    gameSpeed: 30,

    grassLifeExpectancy: 1000,
    grassRegrowthRate: 0.05, // 5% chance per tick if empty? maybe too high for 65k cells.
    // Actually better logic: random grow or spread. 
    // Let's use simplified spread model or random spawn.

    sheepLifeExpectancy: 150,
    sheepEnergyDecay: 1,
    sheepReproductionThreshold: 10,
    sheepInitialCount: 500,

    wolfLifeExpectancy: 200,
    wolfEnergyDecay: 1,
    wolfReproductionThreshold: 15,
    wolfHuntingRadius: 10,
    wolfInitialCount: 50,
};

export interface Checkpoint {
    tick: number;
    grassCount: number;
    sheepCount: number;
    wolfCount: number;
}
