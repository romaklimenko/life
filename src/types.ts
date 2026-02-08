/**
 * Life Ecosystem Simulation - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the simulation engine. Types are organized by domain: entities, configuration,
 * and simulation state.
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Enum representing the type of entity occupying a cell.
 * EMPTY cells can grow grass, other entities move and interact.
 */
export enum EntityType {
    /** Empty cell - can grow grass */
    EMPTY = 0,
    /** Grass - food source for sheep */
    GRASS = 1,
    /** Sheep - eats grass, hunted by wolves */
    SHEEP = 2,
    /** Wolf - predator that hunts sheep */
    WOLF = 3,
}

/**
 * Base interface for all living entities in the simulation.
 * Contains common properties shared by grass, sheep, and wolves.
 */
export interface BaseEntity {
    /** Type identifier for the entity */
    type: EntityType;
    /** X coordinate on the grid (0-254) */
    x: number;
    /** Y coordinate on the grid (0-254) */
    y: number;
    /** Current age in ticks (increments each simulation step) */
    age: number;
}

/**
 * Grass entity - grows on empty cells and serves as food for sheep.
 * Grass is stationary and dies after reaching its life expectancy.
 */
export interface GrassEntity extends BaseEntity {
    type: EntityType.GRASS;
}

/**
 * Sheep entity - herbivore that eats grass to survive and breed.
 * Moves randomly, dies from starvation or old age.
 */
export interface SheepEntity extends BaseEntity {
    type: EntityType.SHEEP;
    /** Number of grass eaten since last breeding */
    foodEaten: number;
    /** Ticks since last meal (resets when eating grass) */
    ticksSinceLastMeal: number;
}

/**
 * Wolf entity - predator that hunts and eats sheep.
 * Has a hunting radius for detecting prey, dies from starvation or old age.
 */
export interface WolfEntity extends BaseEntity {
    type: EntityType.WOLF;
    /** Number of sheep eaten since last breeding */
    foodEaten: number;
    /** Ticks since last meal (resets when eating sheep) */
    ticksSinceLastMeal: number;
}

/**
 * Union type for all entity types, including empty cells.
 * Used in grid storage and entity processing.
 */
export type Entity = GrassEntity | SheepEntity | WolfEntity | null;

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration parameters for grass behavior.
 */
export interface GrassConfig {
    /** Maximum age before grass dies (in ticks) */
    lifeExpectancy: number;
    /** Initial number of grass cells to spawn */
    initialCount: number;
    /** Percentage chance (1-100) for new grass to spread each tick */
    spreadRate: number;
}

/**
 * Configuration parameters for sheep behavior.
 */
export interface SheepConfig {
    /** Maximum age before sheep dies (in ticks) */
    lifeExpectancy: number;
    /** Initial number of sheep to spawn */
    initialCount: number;
    /** Ticks without food before sheep dies */
    starvationTime: number;
    /** Number of grass needed to eat before breeding */
    breedThreshold: number;
    /** Detection radius for finding grass (in cells) */
    grazingRadius: number;
}

/**
 * Configuration parameters for wolf behavior.
 */
export interface WolfConfig {
    /** Maximum age before wolf dies (in ticks) */
    lifeExpectancy: number;
    /** Initial number of wolves to spawn */
    initialCount: number;
    /** Ticks without food before wolf dies */
    starvationTime: number;
    /** Number of sheep needed to eat before breeding */
    breedThreshold: number;
    /** Detection radius for finding sheep (in cells) */
    huntingRadius: number;
}

/**
 * Complete simulation configuration combining all entity configs.
 */
export interface SimulationConfig {
    grass: GrassConfig;
    sheep: SheepConfig;
    wolf: WolfConfig;
    /** Simulation speed in ticks per second */
    gameSpeed: number;
}

// ============================================================================
// State Types
// ============================================================================

/**
 * Population counts at a single point in time.
 */
export interface PopulationCounts {
    grass: number;
    sheep: number;
    wolves: number;
}

/**
 * Single data point for population history chart.
 */
export interface PopulationDataPoint extends PopulationCounts {
    /** Tick number when this data was recorded */
    tick: number;
}

/**
 * Current state of the simulation.
 */
export interface SimulationState {
    /** Current tick number (increments each simulation step) */
    tick: number;
    /** Whether the simulation is currently running */
    isRunning: boolean;
    /** Current population counts */
    population: PopulationCounts;
    /** Historical population data for charting */
    history: PopulationDataPoint[];
}

// ============================================================================
// Grid Constants
// ============================================================================

/** Width of the simulation grid in cells */
export const GRID_WIDTH = 255;
/** Height of the simulation grid in cells */
export const GRID_HEIGHT = 255;
/** Total number of cells in the grid */
export const GRID_SIZE = GRID_WIDTH * GRID_HEIGHT;

// ============================================================================
// Direction Helpers
// ============================================================================

/**
 * Represents a direction for movement as dx/dy offsets.
 */
export interface Direction {
    dx: number;
    dy: number;
}

/**
 * All 8 possible movement directions (including diagonals).
 */
export const DIRECTIONS: Direction[] = [
    { dx: -1, dy: -1 }, // NW
    { dx: 0, dy: -1 },  // N
    { dx: 1, dy: -1 },  // NE
    { dx: -1, dy: 0 },  // W
    { dx: 1, dy: 0 },   // E
    { dx: -1, dy: 1 },  // SW
    { dx: 0, dy: 1 },   // S
    { dx: 1, dy: 1 },   // SE
];

/**
 * 4-directional movement (no diagonals) - used for grass spread.
 */
export const CARDINAL_DIRECTIONS: Direction[] = [
    { dx: 0, dy: -1 },  // N
    { dx: -1, dy: 0 },  // W
    { dx: 1, dy: 0 },   // E
    { dx: 0, dy: 1 },   // S
];
